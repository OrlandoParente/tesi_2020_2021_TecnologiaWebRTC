"use strict";
( async function(){


    // recuper elementi html
    var local_video = document.getElementById("local_video");
    var remote_video = document.getElementById("remote_video");
    var chat_container = document.getElementById("chat_container");
    var messages_container = document.getElementById("messages_container"); // contiene tutti i messaggi inviati e ricevuti
    var write_msg_area = document.getElementById("write_msg_area");         // area in cui l'user scrive il messaggio da inviare
    var bt_send_msg = document.getElementById("bt_send_msg");
    var bt_quit = document.getElementById("bt_quit");

    var bt_switch_video = document.getElementById("bt_switch_video");
    var img_switch_video = document.getElementById("img_switch_video");
    var bt_switch_audio = document.getElementById("bt_switch_audio");
    var img_switch_audio = document.getElementById("img_switch_audio");

    

    var this_room_id = "";
    var this_room_psw = "";
    var is_deleted_room = false;
    var is_quit_on_delete_room_req = false;

    // -------- configuration constants --------------------------
    // si trova in js/js_consts.js
    // const signaling_server = "http://localhost/html/signaling_server/signaling_server.php";
    const constraints = {'video': true, 'audio': true};

    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const lc = new RTCPeerConnection(configuration);
    // -----------------------------------------------------------


    // ---------------- Recupera i dati passati tramite l'url --------------
    var query_str = self.location.search;
    var url_params = new URLSearchParams( query_str );

    var cr_comment = url_params.get("room_description");
    var cr_password = url_params.get("room_psw");
    this_room_psw = cr_password; // recupera le informazioni per eliminare la room

    console.log( " room desc -> " + cr_comment + " ; room psw -> " + cr_password );
    // ---------------------------------------------------------------------

    try{
        // ------------------ Stream Local Video from local media -----------------
        
        const local_stream = await navigator.mediaDevices.getUserMedia(constraints);

        // aggiungo le tracce alla peer connection
        local_stream.getTracks().forEach( track => { 
            lc.addTrack(track, local_stream ) ;
        } );
        // aggiungo lo stream all'elemento video locale 
        local_video.srcObject = local_stream;
        // ------------------------------------------------------------------------

        // ----------- BUTTONS SWITCH AUDIO AND VIDEO -----------------------------
        
        bt_switch_video.onclick = e => { 
            console.log("Offer Peer : bt video switch clickled");

            var track_state = true;

            local_stream.getVideoTracks().forEach( video_track => { 
                console.log( "video track : " + video_track.enabled );
                video_track.enabled = ! video_track.enabled;
                track_state = video_track.enabled;
            } );

            if( track_state )
                // bt_switch_video.innerText = "TURN OFF VIDEO";
                img_switch_video.src = "icons/cam_off.png";
            else 
                // bt_switch_video.innerText = "TURN ON VIDEO";
                img_switch_video.src = "icons/cam_on.png";

            // local_video.srcObject.getTracks().getConstraints();
        }

        bt_switch_audio.onclick = e => {
            console.log("Offer Peer : bt audio switch clickled");

            var track_state = true;

            local_stream.getAudioTracks().forEach( audio_track => { 
                console.log( audio_track.enabled );
                audio_track.enabled = ! audio_track.enabled;
                track_state = audio_track.enabled;
            } );

            if( track_state )
                // bt_switch_audio.innerText = "TURN OFF AUDIO";
                img_switch_audio.src = "icons/mic_off.png";
            else 
                // bt_switch_audio.innerText = "TURN ON AUDIO";
                img_switch_audio.src = "icons/mic_on.png";

        }
        // ------------------------------------------------------------------------

    }catch( e ){
            
        // Se non viene dato il permesso di accesso
        // rieorna alla schermata principale
        self.location.href="index.html";
    }


    // ------------- DATA CHANNEL ---------------------------------------------
    const dc = lc.createDataChannel("channel");
    // gestione dei messaggi
    dc.onmessage = e => {
        console.log( "MSG RECIVED -> " + e.data );
        messages_container.value +=  "REMOTE PEER -> " + e.data + "\n" ;

        // Eventualmente scrolla in basso la textarea
        messages_container.scrollTop = messages_container.scrollHeight;
    }
    dc.onopen = e => console.log("Connection Opended");
    // ------------------------------------------------------------------------

    /*
    * Una volta creata la connessione peer to peer
    * la room contenenti le sdp answer ed offer può essere eliminata
    */
    function delete_room(){

        console.log("Deleting room in progress : enter in delete_room function ... ");

        fetch( signaling_server + "?cmd=delete_room&room_id="+this_room_id+"&room_psw="+this_room_psw)
        .then( resp => { 
                if(resp.ok ) {
                
                    is_deleted_room = true;
                    console.log("Succefull Room Deleted"); 

                    if ( is_quit_on_delete_room_req ) self.location.href = "index.html";
                
                } else { 
                    console.log("Error");
                }
            } );
    }


    // ---- attesa attiva della sdp answer -------

    /*
     * Dopo aver inviato l'offer al server
     * con una ATTESA ATTIVA, aspetta una answer
     */
    async function wait_for_answer( room_id, room_psw ){

        var quit = false;

        while( true ){

            // Se ha ricevuto una answer non richiede di nuovo un check al server 
            if( ! quit )
                fetch( signaling_server + "?cmd=check_answer&room_id=" + room_id + "&room_psw=" + room_psw  )
                .then( async res => {

                    var dati = await res.json();
                    var jo_answ = JSON.parse( dati );
                    // console.log( jo_answ["room_answer"] );
                    var sdp_answ = "NULL";

                    try{
                        // console.log( JSON.parse( jo_answ["room_answer"] ) );
                        sdp_answ = JSON.parse( jo_answ["room_answer"] );
                        console.log( sdp_answ );

                    } catch( e ){
                        console.log( jo_answ["room_answer"] );
                    }

                    if( !quit && sdp_answ != "NULL" && sdp_answ != "null" ){
                        lc.setRemoteDescription( sdp_answ /*JSON.parse( jo_answ["room_answer"] ) */ )
                        .then( e => { 
                            console.log("Connection Opened !! ")

                            
                            // ------------ get remote video stream -------------------------
                            /*
                            const remote_stream = new MediaStream();
                            remote_video.srcObject = remote_stream;
                            
                            lc.addEventListener('track', async (event) => {
                                remote_stream.addTrack(event.track, remote_stream);
                                console.log("Track get from local connection");
                            });
                            */

                            // --------------------------------------------------------------

                        } );

                        const remote_stream = new MediaStream();
                        remote_video.srcObject = remote_stream;
                        
                        lc.addEventListener('track', async (event) => {
                            remote_stream.addTrack(event.track, remote_stream);
                            console.log("Track get from local connection");
                        });

                        quit = true;
                    }

                });

            if( quit ){

                console.log("I'm quitting from loop, because I get a sdp answer!");

                // una volta stabilita la connessione peer to peer
                // la room contenente le rispettive sdp answer ed sdp offer
                // può essere eliminata
                // ( fine fase di signaling )
                delete_room();

                
                break;
                console.log("If you read this, I'am not quitted from loop D: ");
            } 

            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // -------------------------------------------



    // ---- Invia la offer al server ------------

    /*
    * Una volta generata la sdp offer, la invia al signaling server 
    */
    function send_offer_to_sig_server( offer ){
  
        var post_offer = new FormData();
        post_offer.append("offer", offer );
        

        fetch( signaling_server + '?cmd='/*get_rooms_list',*/+'create_room' // &offer=' + offer
            +'&room_description=' + cr_comment.trim() + '&room_psw='+cr_password.trim(),
            { 
                method: "POST",
                body: post_offer
            }
        ).then(async response => {
            try {
                const data = await response.json();
                console.log('response data: \n',  JSON.parse(data) );

                var json_rooms_list =  JSON.parse(data);
                // recupera le informazioni per eliminare la room
                
                var i = 0;
                for( i ; ; i ++ ){
                    if( typeof json_rooms_list[i] === 'undefined' ) break;
                }

                if( i > 0 ) {
                    // Se c'è più di una room, l'id room sarà l'id dell (i - 1)-esima room della lista
                    i --;
                    this_room_id = json_rooms_list[i]["room_id"];
                } else {
                    // Se non c'è nessun'altra room, l'id room sarà 1
                    // i = 0;
                    this_room_id = 1;
                }

                
                console.log( "This room id " + this_room_id );
                console.log( "This room psw " + this_room_psw );


                wait_for_answer( this_room_id, this_room_psw );

            
            } catch(error) {
                console.log('Error happened here!')
                console.error(error)
            }
        });

    }


    /*
    * Quando viene creata una sdp offer, la invia al server
    */
    lc.onicecandidate = e =>{
        // offer_box.value = JSON.stringify( lc.localDescription );
        if( e.candidate ){
            // se c'è un altro candidato, lo aggiunge alla lista dei candidati
        } else { // se non ci sono più candidati, invia la sdp offer generata al signaling server

            send_offer_to_sig_server( JSON.stringify( lc.localDescription )  );
        }
    } 
    
    // ------------------------------------------


    lc.createOffer().then( o => lc.setLocalDescription( o ) );

    



    //
    bt_quit.onclick = () => { 

     // Se la room non è stata ancora cancellata quando l'offer peer esce; la cancella 
        if( ! is_deleted_room ){
            
            // segnala che una volta cancellata la room vogliamo ritornare alla chermata principale
            is_quit_on_delete_room_req = true;
            delete_room();
            // is_deleted_room = true; // <<--- non serve perchè si esce dalla pagina subito dopo 
        } else {
            // se la room è stata già cancellata, ritorna alla schermata principale
            self.location.href = "index.html";
        }



    };

    bt_send_msg.onclick = () => {
        
        if( dc.readyState == "open" ){

            // invia messaggio -------
            messages_container.value += "YOU -> " + write_msg_area.value + "\n";
            dc.send( write_msg_area.value );
            // -----------------------

            // Eventualmente scolla in basso la textarea
            messages_container.scrollTop = messages_container.scrollHeight;

            // pulisce l'area per la scrittura di un nuovo messaggio
            write_msg_area.value = "";

        } else {

            alert("Data Channel is close!");

        }
    }


    window.onload = e => self.location.href = "index.html";


} )();