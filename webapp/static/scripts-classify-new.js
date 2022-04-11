var binMap = {'#017AFE': 'Blue', '#111111': 'Black', '#34C759': 'Green', '#AF52DE': 'Provincial Take Back Item'}
var colorMap = {0: '#111111', 1:'#AF52DE', 2:'#017AFE', 3:'#AF52DE', 4:'#017AFE',5:'#017AFE', 6:'#111111', 7:'#AF52DE',8:'#017AFE',9:'#111111',10:'#AF52DE',11:'#111111',12:'#111111',13:'#111111',14:'#34C759',15:'#017AFE',16:'#111111',
  17:'#AF52DE',18:'#AF52DE',19:'#017AFE',20:'#AF52DE',21:'#111111'}

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
    var predicted = document.getElementById('predicted')
    document.getElementById("submit-photo").disabled = true
    document.getElementById("upload-photo").disabled = true
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
    ctx.fillText('Classifying...', canvas.width/2, canvas.height-30);

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
            //document.getElementById("pred").innerHTML = JSON.stringify(json)
            //document.getElementById("openClassification").style.display = "block"
            //json = {Class: 'cigarette-butt', 'Confidence Level': '17.5%', 'Predicted Index': '6'}
            document.getElementById("submit-photo").disabled = false
            document.getElementById("upload-photo").disabled = false
            document.getElementById('predictions').style.display = 'block'
            var predicted_index = json['Predicted Index']
            var confidence = json['Confidence Level']
            var predicted_class = json['Class']

            var canvas = document.getElementById('canvas')
            var ctx = canvas.getContext('2d');
            ctx.drawImage(window.img, 0, 0, canvas.width, canvas.height);
            var p = document.createElement("p")
            p.className="p-2"
            p.style.fontSize='20px'
            p.style.fontWeight ='700'
            p.style.color =  colorMap[predicted_index]
            if(binMap[colorMap[predicted_index]] != 'Provincial Take Back Item')
                p.innerHTML = `${predicted_class} -> Goes in the ${binMap[colorMap[predicted_index]]} Bin`

            else
                p.innerHTML = `${predicted_class} -> This is a Provincial Take Back Item`
            
            document.getElementById('predicted').appendChild(p)
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
    /*let img = new Image();
    img.src = 'https://dataknyts-nyt-dump.s3.us-west-2.amazonaws.com/tbc-static/classify-placeholder.png';

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
        document.getElementById("photo-for-upload").src = "https://dataknyts-nyt-dump.s3.us-west-2.amazonaws.com/tbc-static/upload-button-classify-mobile.svg"
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