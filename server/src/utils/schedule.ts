import cron from "node-cron";

import Audio from "#/models/audio";
import AutoGeneratedPlaylist from "#/models/autoGeneratedPlaylist";

// The five fields in the cron syntax represent (in order) minutes, hours, day of the month, month, and day of the week.

const genratePlaylist = async () => {
  const result = await Audio.aggregate([
    { $sort: { likes: -1 } },
    //sample - size only moves 20 data at a time - alternative to limit
    { $sample: { size: 20 } },
    {
      $group: {
        _id: "$category",
        audios: {
          $push: "$$ROOT._id",
        },
      },
    },
    // {
    //   $limit: 20,
    // },
  ]);
  result.map(async (item) => {
    await AutoGeneratedPlaylist.updateOne(
      {
        //title will be most liked audio by category
        title: item._id,
      },
      {
        $set: {
          items: item.audios,
        },
      },
      //upsert: true will create new one with same title in AutoGeneratedPlaylist if title is not found
      {
        upsert: true,
      }
    );
  });
};

//this will run on every 2 seconds
// cron.schedule("*/2 * * * * *", () => {
//   console.log("I am running ...");
// });

//this will run on every 24 hrs
//The below is the code to run crone job every day 12 AM
cron.schedule("0 0 0 * * *", async () => {
  //   console.log("I am running ...");
  await genratePlaylist();
});