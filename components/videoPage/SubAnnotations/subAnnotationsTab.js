import React, { useState, useRef, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import SubAnnotationsVis from "./subAnnotationsVis";

function SubAnnotationsTab(props) {
  const [subannotations, addSubAnnotation] = useState([]);
  const [activeTab, activateTab] = useState(0);
  const [activeSubAnnotationIndex, changeActiveSubAnnotationIndex] = useState(
    9
  );
  const [activeSubAnnotation, changeActiveSubAnnotation] = useState({});
  const newTitle = useRef(null);

  useEffect(() => {
    props.updateAnnotations({ ...props.selectedAnnotation, subannotations });
  }, [activeSubAnnotationIndex]);
  const handleSubmit = e => {
    e.preventDefault();
    const newSubAnnotations = [
      ...subannotations,
      {
        title: newTitle.current.value,
        annotations: []
      }
    ];
    addSubAnnotation(newSubAnnotations);
    newTitle.current.value = "";
  };
  const addNewSubAnnotation = newSubAnnotation => {
    addSubAnnotation(
      subannotations.map(annotation =>
        annotation.title === newSubAnnotation.title
          ? newSubAnnotation
          : annotation
      )
    );
    changeActiveSubAnnotationIndex(activeSubAnnotationIndex + 1);
  };
  const editAnnotation = annotation => {
    changeActiveSubAnnotation(annotation);
    activateTab(
      subannotations.findIndex(
        subannotation => subannotation.title === annotation.tag
      )
    );
  };
  return (
    <>
      <div id="ann-tooltip" />
      <br />

      <div id="subAnn-tooltip" style={{ bottom: "8px" }}></div>
      <SubAnnotationsVis
        annotationData={subannotations
          .map(element => element.annotations)
          .flat(1)}
        seekTo={props.seekTo}
        currentTime={props.currentTime}
        annotationLength={props.annotationLength}
        divId={"#sub-annotations"}
        tooltipId={"#subAnn-tooltip"}
        key={activeSubAnnotationIndex}
        selectedAnnotation={props.selectedAnnotation}
        editAnnotation={editAnnotation}
      >
        <div id="sub-annotations" style={{ bottom: "8px" }}></div>
      </SubAnnotationsVis>
      <Tabs
        selectedIndex={activeTab}
        onSelect={tabIndex => {
          if (tabIndex === subannotations.length) return;
          activateTab(tabIndex);
          changeActiveSubAnnotation({});
        }}
      >
        <TabList>
          {subannotations.map((annotation, index) => {
            return <Tab key={annotation.title}>{annotation.title}</Tab>;
          })}
          <Tab>
            <form class="form-inline" onSubmit={handleSubmit}>
              <input
                type="text"
                class="form-control form-control-sm"
                id="formGroupExampleInput2"
                placeholder="Add Sub-annotation"
                ref={newTitle}
                key={"newTab"}
              />
            </form>
          </Tab>
        </TabList>
        {subannotations.map((annotation, index) => (
          <TabPanel key={index}>
            {AddAnnotation(
              props.currentTime,
              subannotations[index],
              addNewSubAnnotation,
              props.selectedAnnotation,
              activeSubAnnotation
            )}
          </TabPanel>
        ))}
      </Tabs>
      <br />
    </>
  );
}

function AddAnnotation(
  currentTime,
  subannotations,
  addNewSubAnnotation,
  selectedAnnotation,
  activeSubAnnotation
) {
  const refStartTime = React.createRef();
  const refEndTime = React.createRef();
  const refDescription = React.createRef();

  const getCurrentTime = e => {
    const time = moment("2015-01-01")
      .startOf("day")
      .seconds(currentTime())
      .format("H:mm:ss");
    if (e.currentTarget.id === "start") {
      refStartTime.current.value = time;
    } else if (e.currentTarget.id === "end") {
      refEndTime.current.value = time;
    }
  };
  const handleSubmit = () => {
    const localNewAnnotation = {
      startTime: refStartTime.current.value,
      endTime: refEndTime.current.value,
      start:
        moment.duration(refStartTime.current.value).asSeconds() -
        selectedAnnotation.start,
      end:
        moment.duration(refEndTime.current.value).asSeconds() -
        selectedAnnotation.start,
      annotation: refDescription.current.value,
      id: subannotations.annotations.length,
      tag: subannotations.title,
      duration: refStartTime.current.value + " - " + refEndTime.current.value
    };
    const start = new moment(localNewAnnotation.start * 1000);
    const end = new moment(localNewAnnotation.end * 1000);
    const diff = moment.duration(end.diff(start));
    localNewAnnotation.totalTime = `${diff.hours()}:${diff.minutes()}:${diff.seconds()}`;

    subannotations.annotations = [
      ...subannotations.annotations,
      localNewAnnotation
    ];
    addNewSubAnnotation(subannotations);
  };

  return (
    <>
      <div class="input-group input-group-sm mb-3">
        <input
          type="text"
          class="form-control"
          placeholder="Start time"
          aria-label="Start time"
          aria-describedby="button-addon2"
          ref={refStartTime}
          value={activeSubAnnotation.startTime}
        />
        <div class="input-group-append">
          <button
            onClick={getCurrentTime}
            class="btn btn-outline-secondary"
            type="button"
            id="start"
            style={{ width: "42px", "padding-top": "1px" }}
            data-placement="bottom"
            title="Get current time"
          >
            <FontAwesomeIcon icon={faClock} />
          </button>
        </div>
        <input
          type="text"
          class="form-control"
          placeholder="End time  "
          aria-label="Start time"
          aria-describedby="button-addon2"
          style={{ "margin-left": "10px" }}
          ref={refEndTime}
          value={activeSubAnnotation.endTime}
        />
        <div class="input-group-append">
          <button
            onClick={getCurrentTime}
            class="btn btn-outline-secondary"
            type="button"
            id="end"
            style={{ width: "42px", "padding-top": "1px" }}
            data-placement="bottom"
            title="Get current time"
          >
            <FontAwesomeIcon icon={faClock} />
          </button>
        </div>
      </div>
      <textarea
        class="form-control"
        id="exampleFormControlTextarea1"
        placeholder="Annotation description"
        rows="3"
        ref={refDescription}
        value={activeSubAnnotation.annotation}
      ></textarea>
      <div
        style={{
          display: "flex",
          "flex-direction": "row-reverse",
          paddingTop: "10px"
        }}
      >
        <button type="button" class="btn btn-success" onClick={handleSubmit}>
          Save
        </button>
      </div>
      <br />
    </>
  );
}

export default SubAnnotationsTab;
