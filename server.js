const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { createReadStream } = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');
const readFile = promisify(createReadStream);
const Replicate = require("replicate");
const axios = require('axios');
const fs = require('fs');


const API_TOKEN = "r8_AEEUYoyKDkqIMWGz1anJvdqb3PYQW3g1L7ZdK";

const typeDefs = gql`
  type Query {
    isDogPresent(imageUrl: String!): String!
  }
`;

const replicate = new Replicate({
  auth: API_TOKEN,
  fetch: fetch
});

async function convertImageUrlToBase64(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
  
      const imageBuffer = Buffer.from(response.data, 'binary');
      const imageBase64 = imageBuffer.toString('base64');
  
      return imageBase64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to convert image to base64');
    }
  }

  const resolvers = {
    Query: {
      isDogPresent: async (_, { imageUrl }) => {
        try {
          const base64Image = await convertImageUrlToBase64(imageUrl);
  
          const output = await replicate.run(
            'andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608',
            {
              input: {
                image: imageUrl,
                question: 'Is there a dog in this image?',
              },
            }
          );
  
          const isDogPresent = output;
          
          if (isDogPresent === null) {
            throw new Error('Failed to process the image');
          }
  
          return isDogPresent;
        } catch (error) {
          console.error(error);
          throw new Error('Failed to process the image');
        }
      },
    },
  };

const server = new ApolloServer({ typeDefs, resolvers });

(async () => {
  await server.start();

  const app = express();
  server.applyMiddleware({ app });

  app.get('/images/:imageName', async (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = resolve(__dirname, 'images', imageName);
    try {
      const imageStream = await readFile(imagePath);
      res.set('Content-Type', 'image/jpeg');
      imageStream.pipe(res);
    } catch (error) {
      console.error('Error reading image:', error);
      res.sendStatus(404);
    }
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
  });
})();
