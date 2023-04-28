// prediction.js
//import * as tmImage from '@teachablemachine/image';
// the link to your model provided by Teachable Machine export panel
const TeachableMachine = require("@sashido/teachablemachine-node");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/pU9FLF85G/"
});

async function predict(image) {

  const predictions = await model.classify({
    imageUrl: image
  }).catch((e) => {
    console.log("ERROR", e);
  });
  return predictions;
}

exports.predict = predict;
