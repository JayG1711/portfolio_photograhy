const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const genAI = new GoogleGenerativeAI('AIzaSyAGCvh1aRz2Fx2So_DqGfkPdVfuiiTbpOw');
  try {
    const models = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAGCvh1aRz2Fx2So_DqGfkPdVfuiiTbpOw');
    const json = await models.json();
    console.log(JSON.stringify(json.models.map(m => m.name), null, 2));
  } catch (e) {
    console.log(e);
  }
}

run();
