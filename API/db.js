const fetch = require("node-fetch");
const { key, clientId } = require("./config"); // create file in API folder and call it config.js

const getDataset = sheetId =>
  new Promise((res, rej) => {
    if (sheetId === undefined) rej("sheet id cannot be undefined");
    return fetch(
      `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=true&fields=sheets(data(rowData(values(hyperlink%2Cnote%2CuserEnteredValue))))&key=${key}`
    )
      .then(response => response.json())
      .then(rowDataset => parse(rowDataset))
      .then(dataset => {
        cacheData(dataset, sheetId);
        res(dataset);
      })
      .catch(e => rej(e));
  });

const getVideoAnnotations = (videoId, sheetId) =>
  new Promise((res, rej) => {
    let dataset = JSON.parse(localStorage.getItem(sheetId));
    // dataset =  fomrate(dataset)
    // cacheData(dataset, "100D6X_VVDrl5wQ9rOkstjCdcU8r5nSZomYiLtkxXdxI")
    if (dataset) {
      return res(findVideo(dataset, videoId));
    } else {
      return res(
        getDataset(sheetId).then(dataset => findVideo(dataset, videoId))
      );
    }
  });
// const fomrate = (dataset) => {
//   let { annotations } = dataset[0];
//   annotations = annotations.map((annotation, i) => {
//     const subAnnotations = annotation.subAnnotations.reduce((accumulator, currentValue, currentIndex, array) => {
//       if (accumulator.find(e => e.description === currentValue.description))
//         return accumulator
//       return  accumulator.concat({ ...currentValue, id: currentIndex })
//     }, []);
//     return { ...annotation, subAnnotations }
//   })

//   debugger
//   return [{ ...dataset[0], annotations }];
// }
const cacheVideoAnnotation = (videoAnnotations, videoId, sheetId) => {
  const dataset = JSON.parse(localStorage.getItem(sheetId));
  const newDataset = dataset.map(video =>
    video.id === videoId ? videoAnnotations : video
  );
  cacheData(newDataset, sheetId);
};
const findVideo = (dataset, videoId) =>
  dataset.find(
    video => video.videoURL.replace("https://youtu.be/", "") == videoId
  );
const cacheData = (dataset, id) =>
  localStorage.setItem(id, JSON.stringify(dataset));

const parse = rowDataset => {
  const dataset = rowDataset.sheets.map(({ data }, sheetIndex) => {
    const videoJSON = {};
    const video = data[0].rowData[2];
    videoJSON.id = `Video${sheetIndex + 1}`;
    videoJSON.videoTitle = video.values[0].userEnteredValue.stringValue;
    videoJSON.videoURL = video.values[1].userEnteredValue.stringValue;
    videoJSON.videoLength =
      video.values[2].userEnteredValue.numberValue * 3600 +
      video.values[3].userEnteredValue.numberValue * 60 +
      video.values[4].userEnteredValue.numberValue;

    videoJSON.programmingLanguage =
      video.values[5].userEnteredValue?.stringValue;

    videoJSON.programmingTools = video.values[6].userEnteredValue?.stringValue;

    videoJSON.githubURL = video.values[7].userEnteredValue?.stringValue;

    videoJSON.projectSize = video.values[8].userEnteredValue?.numberValue;

    videoJSON.developerGithubURL =
      video.values[9].userEnteredValue?.stringValue;

    let annotationsData = data[0].rowData.splice(10, data[0].rowData.length);
    videoJSON.annotations = [];
    //remove empty cells from the spreedsheet
    const filteredAnnotationsData = annotationsData.filter(
      annotation => annotation.values?.[0].userEnteredValue != undefined
    );

    videoJSON.annotations = filteredAnnotationsData.map(annotation =>
      JSON.parse(annotation.values[0].userEnteredValue.stringValue)
    );
    return videoJSON;
  });
  return dataset;
};
const googleLogin = () => {
  return new Promise((res, rej) =>
    gapi.load("client:auth2", () =>
      gapi.client
        .init({
          apiKey: key,
          clientId: clientId,
          scope: "https://www.googleapis.com/auth/spreadsheets",
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4"
          ]
        })
        .then(
          () => {
            gapi.auth2
              .getAuthInstance()
              .isSignedIn.listen(signedIn => res(true));
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
              res(true);
            } else {
              gapi.auth2.getAuthInstance().signIn();
            }
          },
          function(error) {
            console.log(JSON.stringify(error, null, 2));
            rej(false);
          }
        )
    )
  );
};

const saveVideoAnnotations = (spreadsheetId, range, annotations) =>
  gapi.load("client:auth2", () =>
    gapi.client
      .init({
        apiKey: key,
        clientId: clientId,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4"
        ]
      })
      .then(
        () => {
          const handleSignedIn = signedIn => {
            if (signedIn) {
              gapi.client.sheets.spreadsheets.values
                .update(
                  { spreadsheetId, range, valueInputOption: "RAW" },
                  { values: [[JSON.stringify(annotations)]] }
                )
                .then(() => {
                  console.log("saved");
                });
            }
          };
          gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(signedIn => handleSignedIn(signedIn));
          if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            handleSignedIn(true);
          } else {
            gapi.auth2.getAuthInstance().signIn();
          }
        },
        function(error) {
          console.log(JSON.stringify(error, null, 2));
        }
      )
  );

module.exports = {
  cacheData,
  getDataset,
  getVideoAnnotations,
  saveVideoAnnotations,
  googleLogin,
  cacheVideoAnnotation
};
