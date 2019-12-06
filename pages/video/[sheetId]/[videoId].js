import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { useRouter } from "next/router";
import moment from "moment";
import Layouts from "../../../components/shared/layouts";
import AnnotationsPage from "../../../components/videoPage/annotationsPage";
import {
  getVideoAnnotations,
  saveVideoAnnotations,
  cacheVideoAnnotation
} from "../../../API/db";

/**
 * Dynamic page for each individual video post page
 */
function MainVideoPage() {
  const [videoAnnotations, updateVideoAnnotations] = useState();
  const [
    videoAnnotationIsStillLoading,
    updateVideoAnnotationIsStillLoading
  ] = useState(true);
  const { videoId, sheetId } = useRouter().query;
  const [YTplaying, YTpause] = useState(false);
  const YTplayerRef = useRef(null);
  useEffect(() => {
    const fetchVideo = async () => {
      let localVideoAnnotations = await getVideoAnnotations(videoId, sheetId);
      localVideoAnnotations.formatedAnnotation = localVideoAnnotations.annotations.map(
        getFormatedAnnotationData
      );
      updateVideoAnnotations(localVideoAnnotations);
      updateVideoAnnotationIsStillLoading(false);
    };

    if (sheetId !== undefined) {
      fetchVideo();
    }
  }, [sheetId]);
  const getFormatedAnnotationData = annotation => {
    const obj = {
      start:
        Number(annotation.duration.start.hours) * 60 * 60 +
        Number(annotation.duration.start.minutes) * 60 +
        Number(annotation.duration.start.seconds),
      end:
        Number(annotation.duration.end.hours) * 60 * 60 +
        Number(annotation.duration.end.minutes) * 60 +
        Number(annotation.duration.end.seconds),
      id: annotation.id,
      tag: annotation.tags,
      annotation: annotation.description,
      duration: `${annotation.duration.start.hours}:${annotation.duration.start.minutes}:${annotation.duration.start.seconds} - ${annotation.duration.end.hours}:${annotation.duration.end.minutes}:${annotation.duration.end.seconds}`,
      // should be available from the database
      subAnnotations: annotation.subAnnotations || []
    };
    const start = new moment(obj.start * 1000);
    const end = new moment(obj.end * 1000);
    const diff = moment.duration(end.diff(start));
    obj.totalTime = `${diff.hours()}:${diff.minutes()}:${diff.seconds()}`;
    return obj;
  };

  const seekTo = seconds => {
    YTplayerRef.current.seekTo(seconds);
    YTpause(true);
  };
  const seekTo_subAnnotations = seconds => {
    YTplayerRef.current.seekTo(moment.duration(seconds).asSeconds());
    YTpause(true);
  };
  const currentTime = () => YTplayerRef.current.getCurrentTime();

  const updateAnnotations = newAnnotation => {
    // update the annotation with the newSubAnnotations
    const annotations = videoAnnotations.annotations.map(
      (currentAnnotation, index) => {
        if (currentAnnotation.id == newAnnotation.id) {
          currentAnnotation.subAnnotations = newAnnotation.subAnnotations;
        }
        return currentAnnotation;
      }
    );
    let localVideoAnnotations = { ...videoAnnotations, annotations };

    //Also update the formated Annotation
    localVideoAnnotations.formatedAnnotation = videoAnnotations.formatedAnnotation.map(
      (annotation, index) => ({
        ...annotation,
        subAnnotations: annotations[index].subAnnotations
      })
    );
    updateVideoAnnotations(localVideoAnnotations);
    //remove the formated data before caching and saving.
    const {
      formatedAnnotation,
      ...newLocalVideoAnnotations
    } = localVideoAnnotations;
    cacheVideoAnnotation(
      newLocalVideoAnnotations,
      newLocalVideoAnnotations.id,
      localStorage.key(0)
    );

    saveVideoAnnotations(
      localStorage.key(0),
      `${newLocalVideoAnnotations.id}!I${newAnnotation.id}`,
      newAnnotation.subAnnotations
    );
  };
  if (videoAnnotationIsStillLoading) {
    return (
      <div>
        <Layouts>
          <div>
            <nav className="navbar navbar-eannotationpand-lg navbar-light bg-white">
              <a className="navbar-brand" style={{ width: "20%" }} href="/">
                <img
                  style={{
                    width: "100%",
                    display: "block",
                    marginLeft: "1%",
                    marginRight: "0px",
                    marginBottom: "7%"
                  }}
                  src="https://i.ibb.co/JmfYfBD/observedev.png"
                />
              </a>
            </nav>
            <br />
          </div>{" "}
          <div className="container">
            <div className="loader"></div>
          </div>
          <div className="container">
            Loading video...
            <br />
          </div>
          <style jsx>
            {`
              .container {
                height: 10em;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .loader {
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid gray;
                width: 120px;
                height: 120px;
                -webkit-animation: spin 2s linear infinite; /* Safari */
                animation: spin 2s linear infinite;
              }
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </Layouts>
      </div>
    );
  }
  return (
    <div style={{ fontFamily: "Lato" }}>
      <Layouts>
        <div>
          <nav className="navbar navbar-expand-lg navbar-light bg-white">
            <a className="navbar-brand" style={{ width: "20%" }} href="/">
              <img
                style={{
                  width: "100%",
                  display: "block",
                  marginLeft: "1%",
                  marginRight: "0px",
                  marginBottom: "7%"
                }}
                src="https://i.ibb.co/JmfYfBD/observedev.png"
              />
            </a>
          </nav>
          <br />
        </div>
        <div
          style={{
            margin: "0 auto",
            height: "700px",
            maxWidth: "1250px"
          }}
        >
          <ReactPlayer
            url={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            ref={YTplayerRef}
            controls={true}
            width="100%"
            height="100%"
            playing={YTplaying}
          />
          <AnnotationsPage
            video={videoAnnotations}
            formatedAnnotationData={videoAnnotations.formatedAnnotation}
            player={{ seekTo, seekTo_subAnnotations, currentTime }}
            updateAnnotations={updateAnnotations}
          />
        </div>
      </Layouts>
    </div>
  );
}

export default MainVideoPage;
