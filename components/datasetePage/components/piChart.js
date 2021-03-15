import { useEffect } from "react";
import * as d3 from "d3";
import { secondsToStringFormat } from "../../../API/time";
export default function PiChart({ data, totalTime, id, color }) {
  useEffect(() => renderChart(), []);
  const sortedData = data.sort((a, b) => b.totalTime - a.totalTime);
  const renderChart = () => {
    const margin = { top: 10, right: 10, bottom: 10, left: 200 },
      width = data.length * 60 - margin.right,
      height = 490;
    // append the svg object to the body of the page
    var svg = d3
      .select(`#my_dataviz${id}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 200)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(
        sortedData.map(function (d) {
          return d.title;
        })
      )
      .padding(0.2);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, sortedData[0]?.totalTime / 60 + 10])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Bars
    svg
      .selectAll("mybar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d.title);
      })
      .attr("width", x.bandwidth())
      .attr("fill", function (d) {
        return color(d.title);
      })
      .attr("height", () => height - y(0))
      .attr("y", () => y(0))
      .on("mouseover", function (event, d) {
        d3
          .select(`#tooltip${id}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .style("opacity", 1)
          .style("background-color", "rgba(0, 0, 0, 0.65)")
          .style("color", "white")
          .style("padding", "3px").text(`Occured ${d.counts} time.
        ${((d.totalTime / totalTime) * 100).toFixed(1)}% of total time.
        `);
      })
      .on("mouseout", () => d3.select(`#tooltip${id}`).style("opacity", 0));

    // Animation
    svg
      .selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", function (d) {
        return y(d.totalTime / 60);
      })
      .attr("height", function (d) {
        return height - y(d.totalTime / 60);
      })

      .delay(function (d, i) {
        return i * 100;
      });
    svg
      .selectAll("mybar")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("x", function (d) {
        return x(d.title) + 30;
      })
      .attr("y", function (d) {
        return y((d.totalTime + 120) / 60);
      })
      .attr("text-anchor", "middle")
      .text(function (d) {
        return `${secondsToStringFormat(d.totalTime)}`;
      });

    // tooltip
    d3.select(`#my_dataviz${id}`)
      .append("div")
      .attr("id", `tooltip${id}`)
      .attr("style", "position: absolute; opacity: 0;");
  };

  return <div id={`my_dataviz${id}`}></div>;
}
