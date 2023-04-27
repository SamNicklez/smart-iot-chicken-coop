import NodeWebcam from 'node-webcam'; // using this library to take a picture

export function takePicture(input) {

  // select which camera
  var pathToCamera = '';
  if (input == 0) {
    pathToCamera = '/dev/video0';
  }
  else {
    pathToCamera = '/dev/video2';
  }

  // Create webcam instance
  const webcam = NodeWebcam.create({
    width: 1280,
    height: 720,
    device: pathToCamera, // path to the webca,
  });
  
  // Take a picture
  webcam.capture('cameraImage.jpg', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      //console.log('Picture taken!');
    }
  });
  
}
