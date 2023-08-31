
// const signaling_server = "http://localhost/html/signaling_server/signaling_server.php";

var nav_func = null;
var rooms_list_func = null;
var create_room_func = null ;

function set_event_func( comp ,func ){

    switch( comp ){
        case "navigator":
            nav_func = func;
            break;

        case "rooms_list":
            rooms_list_func = func;
            break;

        case "create_room":
            create_room_func = func;
            break;

    }

}

function resize_components ()  {
        console.log( window.length );
        if ( nav_func != null ) nav_func();
        if ( rooms_list_func != null ) rooms_list_func();
        if ( create_room_func != null ) create_room_func();

}

window.onresize = resize_components;
window.onload = resize_components;
