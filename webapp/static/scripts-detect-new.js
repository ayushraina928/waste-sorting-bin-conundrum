var colorMap = {1: '#017AFE', 2: '#017AFE', 3: '#017AFE', 4: '#111111', 5: '#017AFE', 6: '#017AFE', 7: '#F73232', 8: '#111111', 9: '#017AFE', 10: '#111111'}
var binMap = {'#017AFE': 'Blue', '#111111': 'Black', '#34C759': 'Green', '#F73232': 'Red'}

var openGithub = (e) => {
    window.open('https://github.com/ayushraina928/waste-sorting-bin-conundrum','_blank')
}

var goToHome = (e) => {
    window.location = './'
}

var openClassification = (e) => {
    window.location = './classify'
}

var readURL = (e) => {
    if (e.files && e.files[0]) {
        var canvas = document.getElementById('canvas')
        canvas.style.display = "block"
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.src = URL.createObjectURL(e.files[0]);
        img.onload = function() {
            window.img = this
            document.getElementById('webcam-default').style.display = 'none'
            document.getElementById('canvas').style.display = 'block'
            document.getElementById("submit-photo").disabled = false
            ctx.drawImage(img, 0, 0,canvas.width,canvas.height);
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
    document.getElementById("submit-photo").disabled = true
    document.getElementById("upload-photo").disabled = true
    var predicted = document.getElementById('predicted')
    do{
        predicted.removeChild(predicted.lastChild)
    }while(predicted.children.length != 1)

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, canvas.width,canvas.height);

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgb(255,255,255,1)'
    ctx.font = '15px "Inter",sans-serif';
    ctx.fillText('Detecting...', canvas.width/2, canvas.height-30);

    data = {
        image_data_url : this.image_data_url
    }
    fetch("./detect-object/",{
        method: 'POST', 
        headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    }).then(resp => resp.json())
      .then(json => {
          //console.log(json)
            //document.getElementById("pred").innerHTML = JSON.stringify(json)
            //document.getElementById("openClassification").style.display = "block"
            document.getElementById("submit-photo").disabled = false
            document.getElementById("upload-photo").disabled = false
            document.getElementById('predictions').style.display = 'block'
            var bboxes = json['rois']
            var classes = json['class_ids']
            var class_names = json['class_names']
            var canvas = document.getElementById('canvas')
            var ctx = canvas.getContext('2d');
            ctx.drawImage(window.img, 0, 0, canvas.width, canvas.height);
            idx = 0
            window.bboxes = bboxes
            for(var bbox of bboxes){
                var p = document.createElement("p")
                p.className="p-2"
                p.style.fontSize='20px'
                p.style.fontWeight ='700'
                p.style.color =  colorMap[classes[idx]]
                if(class_names[classes[idx]] != 'Other')
                    p.innerHTML = `${idx+1}. ${class_names[classes[idx]]} -> Goes in the ${binMap[colorMap[classes[idx]]]} Bin`

                else
                    p.innerHTML = `${idx+1}. ${class_names[classes[idx]]} -> Unable to Classify Item`

                document.getElementById('predicted').appendChild(p)

                ctx.lineWidth = colorMap[classes[idx]];
                ctx.strokeStyle = colorMap[classes[idx]];
                ctx.fillStyle = colorMap[classes[idx]];
                 
                /*if(classes[idx] != 7){
                    ctx.strokeStyle = colorMap[classes[idx]];//'green';
                    ctx.fillStyle = colorMap[classes[idx]];//'green'
                }*/
                y1 = bbox[0]
                x1 = bbox[1]
                y2 = bbox[2]
                x2 = bbox[3]
                ctx.strokeRect(x1,y1,x2-x1,y2-y1);
                //ctx.fillRect(x1,y1,x1+10,y1+10)
                ctx.fillRect(x1,y1,20,20)
                ctx.font = '17px "Inter",sans-serif';
                ctx.fillStyle = 'white';
                ctx.fillText((idx+1).toString(), x1 + 10, y1 + 15);
                idx += 1
            }
      })

}

var attachListeners = () => {
    let start_camera = document.querySelector("#start-camera");
    //let stop_camera = document.querySelector("#stop-camera");
    let video = document.querySelector("#video");
    let click_photo = document.querySelector("#click-photo");
    let canvas = document.querySelector("#canvas");
    let submit_button = document.querySelector("#submit-photo")
    let upload_button = document.querySelector("#upload-photo")
    let ctx = canvas.getContext('2d');
    let img = new Image();
    //img.setAttribute('crossorigin','anonymous')
    /*img.src = 'https://dataknyts-nyt-dump.s3.us-west-2.amazonaws.com/tbc-static/webcam-default.png';

    img.onload = function () {
        //draw background image
        ctx.drawImage(img, 0, 0,canvas.width,canvas.height);
        //draw a box over the top
    };*/


    video.style.display = "none"
    canvas.style.display = "none"

    start_camera.addEventListener('click', async function() {
        StartWebCam(video)
        canvas.style.display = "none"
        video.style.display = "block"
    });

    /*stop_camera.addEventListener('click', async function() {
        StopWebCam(video)
    });*/

    click_photo.addEventListener('click', function() {
        canvas.style.display = "block"
        video.style.display = "none"
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        StopWebCam(video)
        this.image_data_url = canvas.toDataURL('image/jpeg');
    }.bind(this));

    upload_button.addEventListener('click', async function() {
        var file_upload = document.querySelector("#file-upload")
        file_upload.click()
    });

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
        document.getElementById("webcam").style.display = 'none'
        document.getElementById("photo-for-upload").src = "https://dataknyts-nyt-dump.s3.us-west-2.amazonaws.com/tbc-static/upload-button-mobile.svg"
        /*document.getElementById("device").innerHTML = '<h1 id="test">Mobile</h1>'+
                                                      '<button id="submit-photo-mobile">Submit</button>'+
                                                      '<canvas id="canvas" width="400" height="300" style="display:none"></canvas>'
        submit_button_mobile = document.querySelector("#submit-photo-mobile")
        submit_button_mobile.addEventListener('click', function() {
            submitPhoto()
        })*/
    }
    else{
        document.getElementById("webcam").style.display = 'none'
        /*document.getElementById("device").innerHTML = '<h1 id="test">Not a Mobile</h1>'+
                                                        '<button id="start-camera">Start Camera</button>'+
                                                        //'<button id="stop-camera">Stop Camera</button>'+
                                                        '<button id="click-photo">Click Photo</button>'+
                                                        '<button id="submit-photo">Submit</button>'+
                                                        '<video id="video" width="400" height="300" autoplay></video>'+
                                                        '<canvas id="canvas" width="400" height="300"></canvas>'*/
    }
    attachListeners()
}

window.addEventListener('load', (event) => {
    isMobile(event)    
});