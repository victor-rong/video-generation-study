# Video Generation Survey

This repository gives a quick and easy way to make user studies comparing videos generated with AI from text prompts. It was created for **4D-fy: Text-to-4D Generation Using Hybrid Score Distillation Sampling** with text-to-4D in mind; feel free to clone and modify it to better suit your purposes.

# Setup

To organize the video assets, we first need to structure the videos as shown below. Note that our python script currently assumes the video filenames reflect the prompt used to generate the video.

```
video_folder
│   methods.json
│
└───method0 # primary method
│   │   prompt0.mp4
│   │   prompt1.mp4
│   │   prompt2.mp4
│   │   ...
│   
└───method1 # comparison method, contains some subset of prompts
│   │   prompt1.mp4
│   │   prompt2.mp4
│   │   ...
│   
└───... # more methods
```

A simple json is also needed, please see `example_methods.json`.

Once these are set up, we can run the generation script. This will create (or overwrite if it exists) the folder `./assets` containing the mp4 files so that users cannot identify their method. We can run this with the example videos and methods.

```
    python ./scripts/main.py ./example_methods.json
```

Deploying the survey to evaluators requires setting up a database, but the frontend can be looked at before then (clicking submit will simply not do anything). After the following two commands, the site can be accessed at `localhost:3000` in any modern browser.


```
    npm install
    npm start
```

A database must be created, either locally or with a third-party service, to confidentially store the survey results. Once the database parameters are assigned in `./config.js`, please run `npm build` to create the necessary tables. Once this is done, the survey results may be collected.

# Admin

The python script also writes `./info.json`, which contains the method information for the survey. Submitting `./info.json` at `localhost:3000/admin` in the browser will show the results per-question as well as aggregate results for each method comparison. Statistical information using chi squared testing is also given.
