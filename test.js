const API_TOKEN = "r8_AEEUYoyKDkqIMWGz1anJvdqb3PYQW3g1L7ZdK";

const replicate = new Replicate({
    auth: API_TOKEN,
  });

const output = await replicate.run(
  "andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608",
  {
    input: {
      image: "..."
    }
  }
);
const prediction = await replicate.predictions.create({
    version: "4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608",
    input: {
      image: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
      caption: false,
      question: "Is there a dog in this image?",
    },
    webhook: "https://example.com/your-webhook",
    webhook_events_filter: ["completed"]
  });