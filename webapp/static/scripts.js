var readURL = (e) => {
    if (e.files && e.files[0]) {
        var canvas = document.getElementById('canvas')
        canvas.style.display = "block"
        var ctx = canvas.getContext('2d');
        var img = new Image;
        img.src = URL.createObjectURL(e.files[0]);
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 320, 240)//,canvas.width,canvas.height);
            window.image_data_url = canvas.toDataURL('image/jpeg');
        }
    }
}

var StopWebCam = (video) => {
    var stream = video.srcObject;
    if(stream){
        var tracks = stream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }
        video.srcObject = null;
    }
}

var StartWebCam = (video) => {
    video = document.getElementById("video"),
        vendorURL = window.URL || window.webkitURL;

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            }).catch(function (error) {
                console.log("Something went wrong");
            });
    }
}

var submitPhoto = () => {
    //console.log(this.image_data_url)
    data = {
        image_data_url : this.image_data_url
    }
    fetch("./send-image/",{
        method: 'POST', 
        headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    }).then(resp => resp.json())
      .then(json => {
          //console.log(json)
          document.getElementById("pred").innerHTML = json
      })

}

var WebCamDesktopUtil = () => {
    let start_camera = document.querySelector("#start-camera");
    let stop_camera = document.querySelector("#stop-camera");
    let video = document.querySelector("#video");
    let click_photo = document.querySelector("#click-photo");
    let canvas = document.querySelector("#canvas");
    let submit_button = document.querySelector("#submit-photo")

    video.style.display = "none"
    canvas.style.display = "none"

    start_camera.addEventListener('click', async function() {
        StartWebCam(video)
        canvas.style.display = "none"
        video.style.display = "block"
    });

    stop_camera.addEventListener('click', async function() {
        StopWebCam(video)
    });

    click_photo.addEventListener('click', function() {
        canvas.style.display = "block"
        video.style.display = "none"
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        StopWebCam(video)
        this.image_data_url = canvas.toDataURL('image/jpeg');
    }.bind(this));

    submit_button.addEventListener('click', function() {
        submitPhoto()
    })
    
}

isMobile = (event) => {
    var agent = navigator.userAgent;      
    var isWebkit = (agent.indexOf("AppleWebKit") > 0);      
    var isIPad = (agent.indexOf("iPad") > 0);      
    var isIOS = (agent.indexOf("iPhone") > 0 || agent.indexOf("iPod") > 0);     
    var isAndroid = (agent.indexOf("Android")  > 0);     
    var isNewBlackBerry = (agent.indexOf("AppleWebKit") > 0 && agent.indexOf("BlackBerry") > 0);     
    var isWebOS = (agent.indexOf("webOS") > 0);      
    var isWindowsMobile = (agent.indexOf("IEMobile") > 0);     
    var isSmallScreen = (screen.width < 767 || (isAndroid && screen.width < 1000));     
    var isUnknownMobile = (isWebkit && isSmallScreen);     
    var isMobile = (isIOS || isAndroid || isNewBlackBerry || isWebOS || isWindowsMobile || isUnknownMobile);     
    var isTablet = (isIPad || (isMobile && !isSmallScreen));     

    if ((isTablet || isMobile) && isSmallScreen && document.cookie.indexOf( "mobileFullSiteClicked=") < 0 ){
        document.getElementById("device").innerHTML = '<h1 id="test">Mobile</h1>'+
                                                      '<button id="submit-photo-mobile">Submit</button>'+
                                                      '<canvas id="canvas" width="320" height="240" style="display:none"></canvas>'
        submit_button_mobile = document.querySelector("#submit-photo-mobile")
        submit_button_mobile.addEventListener('click', function() {
            submitPhoto()
        })
    }
    else{
        document.getElementById("device").innerHTML = '<h1 id="test">Not a Mobile</h1>'+
                                                        '<button id="start-camera">Start Camera</button>'+
                                                        '<button id="stop-camera">Stop Camera</button>'+
                                                        '<button id="click-photo">Click Photo</button>'+
                                                        '<button id="submit-photo">Submit</button>'+
                                                        '<video id="video" width="320" height="240" autoplay></video>'+
                                                        '<canvas id="canvas" width="320" height="240"></canvas>'
        WebCamDesktopUtil()
    }
}

window.addEventListener('load', (event) => {
    isMobile(event)    
});