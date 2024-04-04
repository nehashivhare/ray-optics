// Glass -> Circle
objTypes['circlelens'] = {

  supportSurfaceMerging: true, // Surface merging

  // Create the obj
  create: function(mouse) {
    return {type: 'circlelens', p1: mouse, p2: mouse, p: 1.5};
  },

  p_box: objTypes['refractor'].p_box,

  // Use the prototype lineobj
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: function(obj, mouse, ctrl, shift) {objTypes['lineobj'].c_mousemove(obj, mouse, false, shift)},
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,

  // When the drawing area is clicked (test which part of the obj is clicked)
  // When the drawing area is pressed (to determine the part of the object being pressed)
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    // clicking on p1 (center)?
    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    // clicking on p2 (edge)?
    if (mouseOnPoint(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    // clicking on outer edge of circle?  then drag entire circle
    if (Math.abs(graphs.length(obj.p1, mouse_nogrid) - graphs.length_segment(obj)) < getClickExtent())
    // clicking inside circle?  then drag entire circle
    //if (Math.abs(graphs.length(obj.p1, mouse_nogrid) < graphs.length_segment(obj)))
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; // Mouse position when the user starts dragging
      draggingPart.mouse1 = mouse; // Mouse position at the last moment during dragging
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  // When the user is dragging the obj
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {objTypes['lineobj'].dragging(obj, mouse, draggingPart, false, shift)},

  // Test if a ray may shoot on this object (if yes, return the intersection)
  rayIntersection: function(obj, ray) {
    if (obj.p <= 0)return;
    var rp_temp = graphs.intersection_line_circle(graphs.line(ray.p1, ray.p2), graphs.circle(obj.p1, obj.p2));
    var rp_exist = [];
    var rp_lensq = [];
    for (var i = 1; i <= 2; i++)
    {

      rp_exist[i] = graphs.intersection_is_on_ray(rp_temp[i], ray) && graphs.length_squared(rp_temp[i], ray.p1) > minShotLength_squared;


      rp_lensq[i] = graphs.length_squared(ray.p1, rp_temp[i]);
    }


    if (rp_exist[1] && ((!rp_exist[2]) || rp_lensq[1] < rp_lensq[2])) {return rp_temp[1];}
    if (rp_exist[2] && ((!rp_exist[1]) || rp_lensq[2] < rp_lensq[1])) {return rp_temp[2];}
  },

  zIndex: objTypes['refractor'].zIndex,

  // Draw the obj on canvas
  draw: function(obj, ctx, aboveLight) {

  ctx.beginPath();
  ctx.arc(obj.p1.x, obj.p1.y, graphs.length_segment(obj), 0, Math.PI * 2, false);
  objTypes['refractor'].fillGlass(obj.p, obj, ctx, aboveLight);
  ctx.lineWidth = 1;
  //ctx.fillStyle="indigo";
  ctx.fillStyle = 'red';
  ctx.fillRect(obj.p1.x - 1.5, obj.p1.y - 1.5, 3, 3);
  //ctx.fillStyle="rgb(255,0,255)";
  if (obj == mouseObj) {
    ctx.fillStyle = 'magenta';
    //ctx.fillStyle="Purple";
    ctx.fillRect(obj.p2.x - 1.5, obj.p2.y - 1.5, 3, 3);
  }


  },

  // When the obj is shot by a ray
  shot: function(obj, ray, rayIndex, rp, surfaceMerging_objs) {

    var midpoint = graphs.midpoint(graphs.line_segment(ray.p1, rp));
    var d = graphs.length_squared(obj.p1, obj.p2) - graphs.length_squared(obj.p1, midpoint);
    if (d > 0)
    {
      // Shot from inside to outside
      var n1 = (!colorMode)?obj.p:(obj.p + (obj.cauchyCoeff || 0.004) / (ray.wavelength*ray.wavelength*0.000001)); // The refractive index of the source material (assuming the destination has 1)
      var normal = {x: obj.p1.x - rp.x, y: obj.p1.y - rp.y};
    }
    else if (d < 0)
    {
      // Shot from outside to inside
      var n1 = 1 / ((!colorMode)?obj.p:(obj.p + (obj.cauchyCoeff || 0.004) / (ray.wavelength*ray.wavelength*0.000001)));
      var normal = {x: rp.x - obj.p1.x, y: rp.y - obj.p1.y};
    }
    else
    {
      // Situation that may cause bugs (e.g. shot at an edge point)
      // To prevent shooting the ray to a wrong direction, absorb the ray
      ray.exist = false;
      return;
    }

    var shotType;

    // Surface merging
    for (var i = 0; i < surfaceMerging_objs.length; i++)
    {
      shotType = objTypes[surfaceMerging_objs[i].type].getShotType(surfaceMerging_objs[i], ray);
      if (shotType == 1)
      {
        // Shot from inside to outside
        n1 *= (!colorMode)?surfaceMerging_objs[i].p:(surfaceMerging_objs[i].p + (surfaceMerging_objs[i].cauchyCoeff || 0.004) / (ray.wavelength*ray.wavelength*0.000001));
      }
      else if (shotType == -1)
      {
        // Shot from outside to inside
        n1 /= (!colorMode)?surfaceMerging_objs[i].p:(surfaceMerging_objs[i].p + (surfaceMerging_objs[i].cauchyCoeff || 0.004) / (ray.wavelength*ray.wavelength*0.000001));
      }
      else if (shotType == 0)
      {
        // Equivalent to not shot on the obj (e.g. two interfaces overlap)
        //n1=n1;
      }
      else
      {
        // Situation that may cause bugs (e.g. shot at an edge point)
        // To prevent shooting the ray to a wrong direction, absorb the ray
        ray.exist = false;
        return;
      }
    }
    objTypes['refractor'].refract(ray, rayIndex, rp, normal, n1);


  },

  getShotType: function(obj, ray) {

    var midpoint = graphs.midpoint(graphs.line_segment(ray.p1, this.rayIntersection(obj, ray)));
    var d = graphs.length_squared(obj.p1, obj.p2) - graphs.length_squared(obj.p1, midpoint);

    if (d > 0)
    {
      return 1; // From inside to outside
    }
    if (d < 0)
    {
      return -1; // From outside to inside
    }
    return 2;
  }

};
