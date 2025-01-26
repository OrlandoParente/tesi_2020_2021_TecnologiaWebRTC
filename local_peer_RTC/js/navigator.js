( function () {

    // default
    const nav = document.getElementsByTagName("nav")[0];
    var open_menu = false;
    var default_text_color = "black";

    focus_event = ( event ) => { event.target.style.color = "white"; event.target.style.backgroundColor = "black"; };
    mouse_enter_event = ( event ) => { 
        event.target.style.color = "white";
        event.target.style.backgroundColor = "black";
        event.target.style.cursor = "pointer";
    };
    reset_item_menu_style = ( event ) => { 
        event.target.style.color = default_text_color; 
        event.target.style.backgroundColor = "lightgray"; 
    };
    on_click_event = ( event ) => { open_menu = true };

    //
    //var a_rooms_page = document.createElement("a");
    var rooms_page = document.createElement("div");
    rooms_page.className = "menu_item";
    rooms_page.innerHTML = "ROOMS";
    rooms_page.style.textAlign = "center";
    rooms_page.style.color = default_text_color;
    rooms_page.style.float = "left";
    //a_rooms_page.appendChild( rooms_page );
    //a_rooms_page.href = "index.html";
    


    rooms_page.onfocus = focus_event;
    rooms_page.onmouseenter = mouse_enter_event;
    rooms_page.onmouseleave = reset_item_menu_style;
    rooms_page.onclick = ( event ) => { self.location.href = "index.html" }; //on_click_event;
    
    // rooms_page.onmouseenter
    var instructions_page = document.createElement("div");
    instructions_page.className = "menu_item";
    instructions_page.innerHTML = "INSTRUCTIONS";
    instructions_page.style.textAlign = "center";
    instructions_page.style.color = default_text_color;
    instructions_page.style.float = "left";
    //instructions_page.href = "instructions.html";

    instructions_page.onfocus = focus_event;
    instructions_page.onmouseenter = mouse_enter_event;
    instructions_page.onmouseleave = reset_item_menu_style;
    instructions_page.onclick = ( event ) => { self.location.href = "instructions.html" }; //on_click_event;

    var about_page = document.createElement("div");
    about_page.className = "menu_item";
    about_page.innerHTML = "ABOUT";
    about_page.style.textAlign = "center";
    about_page.style.float = "left";
    
    about_page.onfocus = focus_event;
    about_page.onmouseenter = mouse_enter_event;
    about_page.onmouseleave = reset_item_menu_style;
    about_page.style.color = default_text_color;
    about_page.href = "about.html";
    about_page.onclick = ( event ) => { self.location.href = "about.html" }; // on_click_event;


    function remove_all_nav_childs (){
        while( nav.lastElementChild ){
            nav.removeChild( nav.lastElementChild );
        }
    }

    function open_mobile_menu (){

        console.log( "open menu -> " + open_menu );

        if( !open_menu ){

            // var rooms_page = document.createElement("div");
            // rooms_page.className = "mobile_menu_item";
            rooms_page.style.width =  "100%";
            // rooms_page.style.display = "block";
            // rooms_page.style.zIndex = 100;
            
            // rooms_page.innerHTML = "ROOMS";
            // rooms_page.style.textAlign = "center";


            // var instructions_page = document.createElement("div");
            // instructions_page.className = "mobile_menu_item";
            instructions_page.style.width = "100%";
            // instructions_page.style.display = "block";
            // instructions_page.style.zIndex = 100;
            
            // instructions_page.innerHTML = "INSTRUCTIONS";
            // instructions_page.style.textAlign = "center";


            // var about_page = document.createElement("div");
            // about_page.className = "mobile_menu_item";
            about_page.style.width = "100%";
            // about_page.style.display = "block";
            // about_page.style.zIndex = 100;
            
            // about_page.innerHTML = "ABOUT";
            // about_page.style.textAlign = "center";

            console.log( " width size -> " + rooms_page.style.getPropertyValue("width") );

            nav.appendChild( rooms_page );
            nav.appendChild( instructions_page );
            nav.appendChild( about_page );


            open_menu = true;

        } else {

            remove_all_nav_childs();
            responsible_menu();

            open_menu = false;

        }
    }


    function responsible_menu(){
           
        var viewportWidth = window.innerWidth;
        console.log("Window size -> " + viewportWidth );

        open_menu = false;


        if( viewportWidth <= 530 ){

            remove_all_nav_childs ();

            nav.style.width = "100%";
            nav.style.height = "50px";
            // nav.style.backgroundColor = "yellow";
            
            //nav.style.backgroundImage = "hamburger_icon.png";
            var hamburger_container = document.createElement("div");
            hamburger_container.style.width = "100%";
            hamburger_container.onclick = open_mobile_menu;

            var hamburger_icon = document.createElement("img"); 
            hamburger_icon.src = "icons/hamburger_icon.png";
            hamburger_icon.style.height = "50px";

            hamburger_container.appendChild( hamburger_icon );
            nav.appendChild( hamburger_container );


        } else if ( viewportWidth > 530 /*&& viewportWidth < 720*/ ){

            remove_all_nav_childs();

            nav.style.width = "100%";
            nav.style.height = "40px";
            // nav.style.backgroundColor = "blue";

            rooms_page.style.width = "150px";
            rooms_page.style.height = "30px";  /* 10px sono di padding */
            // rooms_page.style.float = "left";
            rooms_page.style.lineHeight = "30px";

            instructions_page.style.width = "150px";
            instructions_page.style.height = "30px";  /* 10px sono di padding */
            // instructions_page.style.float = "left";
            instructions_page.style.lineHeight = "30px";
            
            about_page.style.width = "150px";
            about_page.style.height = "30px";  /* 10px sono di padding */
            // about_page.style.float = "left";
            about_page.style.lineHeight = "30px";

            nav.appendChild( rooms_page );
            nav.appendChild( instructions_page );
            nav.appendChild( about_page );

        } /*else {

        }*/
    }


    responsible_menu();
    set_event_func( "navigator", responsible_menu );
    // window.onresize = responsible_menu;





}) ();