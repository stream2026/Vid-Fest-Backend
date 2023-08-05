const { StatusCodes } = require("http-status-codes");
const { Video } = require("./models/video");
const cron = require('node-cron');
const mongoose = require('mongoose');

const updateDataHourly =async () => {
    try {
        const jsonData= await Video.find({});
        for (let i = 0; i < jsonData.length; i++) {
          const videoData = jsonData[i];
          const objectId=videoData._id; 
          const views = videoData.views;
          const likes = videoData.likes;
          const comments = videoData.comments.length;
          const dislikes=videoData.dislikes;
        
          
          const newEval = views + likes*15 +comments*20-dislikes*20;
        
          console.log(views,likes,comments,newEval);
          await Video.updateOne({ _id:objectId }, { $set:{ eval:newEval}});
        }
       
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
  
};


const startCronJob = () => {
  
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly update...');
    updateDataHourly();
  });
};

module.exports = { startCronJob };
