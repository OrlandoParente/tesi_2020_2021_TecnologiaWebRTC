( async function(){
    // recupera elementi html
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


    // Raccoglie le informazioni passate nell'url ----
    const query_str = self.location.search;
    const url_params = new URLSearchParams( query_str ); 
    const offer_room_id = url_params.get("room_id");
    const offer_room_psw = url_params.get("room_psw");
    const offer_room_index = url_params.get("room_index");

    // var remote_data_channel;

    console.log("Passato in get : offer_room_id = " + offer_room_id + " ; offer_room_psw = " + offer_room_psw
        + "offer_room_index = " + offer_room_index );
    // -----------------------------------------------

    // inizializzazione costanti -------
    // si trova in js/js_consts.js
    // const signaling_server = "http://localhost/html/signaling_server/signaling_server.php";


    const constraints = {'video': true, 'audio': true};    
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
    const rc = new RTCPeerConnection( configuration );
    // ---------------------------------

    try{
        // ------------------ Stream Local Video from local media -----------------
        const local_stream = await navigator.mediaDevices.getUserMedia( constraints );
        // aggiungo le tracce alla peer-to-peer connection
        local_stream.getTracks().forEach( track => { 
            rc.addTrack(track, local_stream ) ;
        } );
        // aggiungo lo stream all'elemento video locale 
        local_video.srcObject = local_stream;
        // -----------------------------------------------------------------------

        // ------------ get remote video stream -------------------------
        const remoteStream = new MediaStream();
        remote_video.srcObject = remoteStream;

        rc.addEventListener('track', async (event) => {
            remoteStream.addTrack(event.track, remoteStream);
            console.log("Track get from remote connection");
        });

        // --------------------------------------------------------------

    
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

    // ----------------- DATA CHANNEL -------------------------------

    // non dobbiamo creare un nuovo DataChannel
    // MA lo ricaviamo dall'altro host
    rc.ondatachannel = e => {
        rc.dc = e.channel;
        rc.dc.onmessage = e => { 
            console.log( "MSG from remote peer -> " + e.data );
            messages_container.value += "REMOTE PEER --> " + e.data + "\n" ;

            // Eventualmente scolla in basso la textarea
            messages_container.scrollTop = messages_container.scrollHeight;
        }
        rc.dc.onopen = e => { console.log( "Connection Opened!!" ) }
    }
    // ------------------------------------------------------------


    // #############################################################


    rc.onicecandidate = e => {
        // answer_box.value = JSON.stringify( rc.localDescription );
        console.log(  " SDP ANSWER : \n " + JSON.stringify( rc.localDescription ) + "\n\n" );


        var dati = new FormData;
        dati.append("answer" , JSON.stringify( rc.localDescription ) );

        // invia l'sdp answer al signaling server
        fetch( signaling_server + "?cmd=join_room&room_id=" + offer_room_id + "&room_psw=" + offer_room_psw, 
            { 
                method : "POST",
                body : dati
            } 
        ).then( async resp => {
            var dati = await resp.json();
            console.log( JSON.parse( dati ) );
        });

     }


    // Recupera la sdp offer dal server ---------------
    var offer = "";
    fetch( signaling_server + "?cmd=get_rooms_list")
    .then( async resp => { 
        var data = await resp.json();
        var json_rooms_list = JSON.parse(data);
        offer = json_rooms_list[ offer_room_index ]["sdp_offer"];
        console.log( offer );


        // dall'offer genera la sdp answer
        rc.setRemoteDescription(  JSON.parse( offer ) );
        await rc.createAnswer().then(
            answ => { rc.setLocalDescription(answ) }
        ) 


    });
    // ------------------------------------------------

   // rc.setRemoteDescription(offer);
   // /*await*/ rc.createAnswer().then( a => rc.setLocalDescription( a ) );
    // #############################################################




    //
    bt_quit.onclick = () => { self.location.href = "index.html" };
    bt_send_msg.onclick = () => {
        
        if( rc.dc.readyState == "open" ){

            // invia messaggio ----------
            messages_container.value += "YOU -> " + write_msg_area.value + "\n";
            rc.dc.send( write_msg_area.value );
            // --------------------------

            // Eventualmente scolla in basso la textarea
            messages_container.scrollTop = messages_container.scrollHeight;

            // pulisce l'area per la scrittura di un nuovo messaggio
            write_msg_area.value = "";

        } else {

            alert("Data Channel is close!");

        }
    }

} )();