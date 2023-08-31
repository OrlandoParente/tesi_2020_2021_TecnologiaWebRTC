( function (){

    // const cr_room_name = document.getElementById("cr_room_name");
    const cr_password = document.getElementById("cr_password");
    const cr_comment = document.getElementById("cr_comment");

    // var cr_label_room_name = document.getElementById("cr_label_room_name");
    var cr_label_password = document.getElementById("cr_label_password");
    var cr_label_comment = document.getElementById("cr_label_comment");

    var cr_fieldset = document.getElementById("cr_fieldset");

    var bt_create_room = document.getElementById("bt_create_room");

    // var room_name = cr_room_name.innerText.trim();

    function print_create_room_components () {
        var win_len = window.innerWidth;


        // cr_label_room_name.style.marginBottom = "10px";
        cr_label_password.style.marginBottom = "10px";
        cr_label_comment.style.marginBottom = "10px";

        // cr_label_room_name.style.marginRight = "0px";
        cr_label_password.style.marginRight = "0px";
        cr_label_comment.style.marginRight = "0px";

        // cr_label_comment.style.float = "none";

        if( win_len <= 350){

            console.log("Resizing components -> " + cr_password.style.width );

            // cr_room_name.style.width = "100%";
            cr_password.style.width = "100%";
            cr_comment.style.width = "100%";

            // cr_label_room_name.style.width = "100%";
            cr_label_password.style.width = "100%";
            cr_label_comment.style.width = "100%";

            // cr_label_room_name.style.display = "block";
            cr_label_password.style.display = "block";
            cr_label_comment.style.display = "block";

        } else if( win_len > 350 && win_len <= 500  ) {

            // cr_label_room_name.style.display = "block";
            cr_label_password.style.display = "block";
            cr_label_comment.style.display = "block";

            // cr_room_name.style.width = "150px";
            cr_password.style.width = "150px";
            cr_comment.style.width = "150px";
        } else if( win_len > 500 && win_len <= 800  ) {

            // cr_room_name.style.width = "150px";
            cr_password.style.width = "150px";
            cr_comment.style.width = "150px";

            // cr_label_room_name.style.marginRight = "5px";
            cr_label_password.style.marginRight = "5px";
            cr_label_comment.style.marginRight = "5px";

            // cr_label_comment.style.float = "left";
            
            // cr_label_room_name.style.display = "inline";
            cr_label_password.style.display = "inline";
            cr_label_comment.style.display = "inline";
            
        } else {

            // cr_room_name.style.width = "150px";
            cr_password.style.width = "200px";
            cr_comment.style.width = "200px";

            // cr_label_room_name.style.marginRight = "5px";
            cr_label_password.style.marginRight = "15px";
            // cr_label_comment.style.marginRight = "15px";

            // cr_label_comment.style.float = "left";
            
            // cr_label_room_name.style.display = "inline";
            cr_label_password.style.display = "inline";
            cr_label_comment.style.display = "inline";
        }

    }

    function create_room(){

        if( /* cr_room_name != null && */ cr_comment != null && cr_password != null ){

            /*
            // <-- crea la room offer
            var offer = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

            fetch( signaling_server + '?cmd=create_room&offer='+offer
            +'&room_description='+cr_comment.value.trim()  +'&room_psw='+cr_password.value.trim() )
            .then(response => response.json() )
            .then(data => console.log( JSON.parse(data) ));

            */


            self.location.href= 'offer_room.html?room_description='+cr_comment.value.trim()  +'&room_psw='+cr_password.value.trim() ;

        } else {
            // Errore, parametri mancanti 
        }
    }


    // window.onresize = print_create_room_components;

    set_event_func( "create_room", print_create_room_components );
    bt_create_room.onclick = create_room;


   /*
    cr_fieldset.onresize = () => {
        console.log("Create Room FieldSet Size : " + cr_fieldset.style.length );
        print_create_room_components();
    }
    */

 } )()