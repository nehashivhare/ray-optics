// Blocker -> Circle Blocker
objTypes['blackcircle'] = {

    // Create the obj
    create: function (mouse) {
        return {type: 'blackcircle', p1: mouse, p2: mouse};
    },

    // Use the prototype lineobj
    c_mousedown: objTypes['lineobj'].c_mousedown,
    c_mousemove: function (obj, mouse, ctrl, shift) {
        objTypes['lineobj'].c_mousemove(obj, mouse, false, shift)
    },
    c_mouseup: objTypes['lineobj'].c_mouseup,
    move: objTypes['lineobj'].move,

    // Draw the obj on canvas
    draw: function (obj, ctx, aboveLight) {

        ctx.beginPath();
        ctx.arc(obj.p1.x, obj.p1.y, graphs.length_segment(obj), 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = getMouseStyle(obj, (colorMode && obj.wavelength && obj.isDichroic) ? wavelengthToColor(obj.wavelength || GREEN_WAVELENGTH, 1) : 'rgb(70,35,10)');
        //ctx.fillStyle="indigo";

        ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.fillRect(obj.p1.x - 1.5, obj.p1.y - 1.5, 3, 3);

        ctx.lineWidth = 1;
        if (obj === mouseObj) {
            ctx.fillStyle = 'magenta';
            ctx.fillRect(obj.p2.x - 1.5, obj.p2.y - 1.5, 3, 3);
        }
    },

    // When the drawing area is clicked (test which part of the obj is clicked)
    // When the drawing area is pressed (to determine the part of the object being pressed)
    clicked: function (obj, mouse_nogrid, mouse, draggingPart) {
        // clicking on p1 (center)?
        if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2)) {
            draggingPart.part = 1;
            draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
            return true;
        }
        // clicking on p2 (edge)?
        if (mouseOnPoint(mouse_nogrid, obj.p2)) {
            draggingPart.part = 2;
            draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
            return true;
        }
        // clicking on outer edge of circle?  then drag entire circle
        if (Math.abs(graphs.length(obj.p1, mouse_nogrid) - graphs.length_segment(obj)) < getClickExtent()) {
            draggingPart.part = 0;
            draggingPart.mouse0 = mouse; // Mouse position when the user starts dragging
            draggingPart.mouse1 = mouse; // Mouse position at the last moment during dragging
            draggingPart.snapData = {};
            return true;
        }
        return false;
    },

    // Show the property box
    p_box: function(obj, elem) {
        dichroicSettings(obj,elem);
    },

    // Test if a ray may shoot on this object (if yes, return the intersection)
    rayIntersection: function (obj, ray) {
        if (obj.p <= 0 || !wavelengthInteraction(obj,ray)) return;
        var rp_temp = graphs.intersection_line_circle(graphs.line(ray.p1, ray.p2), graphs.circle(obj.p1, obj.p2));
        var rp_exist = [];
        var rp_lensq = [];
        for (var i = 1; i <= 2; i++) {

            rp_exist[i] = graphs.intersection_is_on_ray(rp_temp[i], ray) && graphs.length_squared(rp_temp[i], ray.p1) > minShotLength_squared;


            rp_lensq[i] = graphs.length_squared(ray.p1, rp_temp[i]);
        }

        if (rp_exist[1] && ((!rp_exist[2]) || rp_lensq[1] < rp_lensq[2])) {
            return rp_temp[1];
        }
        if (rp_exist[2] && ((!rp_exist[1]) || rp_lensq[2] < rp_lensq[1])) {
            return rp_temp[2];
        }
    },


    // When the user is dragging the obj
    dragging: function (obj, mouse, draggingPart, ctrl, shift) {
        objTypes['lineobj'].dragging(obj, mouse, draggingPart, false, shift)
    },

    // When the obj is shot by a ray
    shot: function (obj, ray, rayIndex, rp) {
        ray.exist = false;
    }

};
