import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { googleLogin } from "../../../API/db";
import {
  stringToSecondsFormat,
  secondsToStringFormat
} from "../../../API/time";
import { RadioButtonGroup } from "react-rainbow-components";

function AnnotationAddForm({
  getCurrentTime,
  addNewSubAnnotation,
  offsetTime,
  annotationTitles,
  newAnnotationId,
  defaultStartTime
}) {
  // getting references
  const refStartTime = React.createRef();
  const refNewTitle = React.createRef();
  const [title, changeTitle] = useState("");
  // getting the current time of the video when the user ask for it
  const getTime = e => {
    const time = secondsToStringFormat(getCurrentTime());
    refStartTime.current.value = time;
  };

  const handleSubmit = async () => {
    const localNewAnnotation = {
      duration: {
        start: {
          time: refStartTime.current.value,
          inSeconds:
            stringToSecondsFormat(refStartTime.current.value) - offsetTime
        },
        end: {
          time: "",
          inSeconds:
            stringToSecondsFormat(refStartTime.current.value) - offsetTime + 10
        }
      },
      id: isNaN(newAnnotationId) ? 11 : newAnnotationId,
      title: title + refNewTitle.current.value,
      description: ""
    };
    try {
      await googleLogin();
    } catch (e) {
      return;
    }
    addNewSubAnnotation(localNewAnnotation);
  };

  const addTitle = event => {
    refNewTitle.current.value = "";
    changeTitle(event.target.value);
  };

  return (
    <>
      <style jsx>
        {`
          .box-sub-annotation {
            border-radius: 0.4em;
            border: 3px solid;
            padding: 5px;
            width: 800px;
            margin: 20px auto;
            transition: left 1s;
          }
        `}
      </style>

      <div className="box-sub-annotation" id="box-sub-annotation">
        {annotationTitles.length > 0 && (
          <>
            <label
              for="StartTime"
              style={{ margin: "3px", paddingLeft: "5px" }}
            >
              Select an existing title or create new one:
            </label>
            <div
              className="rainbow-p-around_x-large rainbow-align-content_center"
              style={{ display: "grid", justifyContent: "center" }}
            >
              <RadioButtonGroup
                id="radio-button-group-component-1"
                options={annotationTitles.map(title => ({
                  value: title,
                  label: title
                }))}
                variant="brand"
                value={title}
                onChange={addTitle}
                required
              />
            </div>
          </>
        )}
        <div
          className="input-group input-group-sm mb-3"
          style={{ margin: "15px 0px" }}
        >
          <label for="StartTime" style={{ margin: "3px", paddingLeft: "5px" }}>
            Create new title:
          </label>
          <input
            type="text"
            ref={refNewTitle}
            className="form-control"
            placeholder="New title"
            defaultValue={""}
            onFocus={() => changeTitle("")}
          ></input>
        </div>
        <div className="input-group input-group-sm mb-3">
          <label for="StartTime" style={{ margin: "3px", paddingLeft: "5px" }}>
            Start:
          </label>
          <input
            id="StartTime"
            key={"startTime"}
            type="text"
            className="form-control"
            placeholder="Start time"
            aria-label="Start time"
            aria-describedby="button-addon2"
            defaultValue={defaultStartTime ?? ""}
            ref={refStartTime}
          />
          <div className="input-group-append">
            <button
              onClick={getTime}
              className="btn btn-outline-secondary"
              type="button"
              id="start"
              style={{ width: "42px", paddingTop: "1px" }}
              data-placement="bottom"
              title="Get current time"
            >
              <FontAwesomeIcon icon={faClock} />
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "80% 20%" }}>
          <button
            type="button"
            className="btn btn-success"
            style={{ gridColumnStart: "2" }}
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default AnnotationAddForm;