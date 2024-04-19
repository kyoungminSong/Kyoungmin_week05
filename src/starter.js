import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////

// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
// console.log(height);

const margin = { top: 30, right: 30, bottom: 30, left: 30 };

// parsing & formatting
const parseTime = d3.timeParse("%Y");
const formatXAxis = d3.timeFormat("%Y");
// const formatTemp = d3.format(",.2f");

// scale
const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// axis
const xAxis = d3
  .axisBottom(xScale)
  .ticks(10)
  .tickFormat((d) => formatXAxis(d))
  .tickSizeOuter(0);

const yAxis = d3
  .axisLeft(yScale)
  .ticks(4)
  .tickPadding(10) //텍스트 왼쪽으로 이동
  .tickSize(-width + margin.right + margin.left);

// line

const line_avg = d3
  .line()
  .curve(d3.curveCardinal)
  .x((d) => xScale(d.year_parsed))
  .y((d) => yScale(d.avg));

// const line_lower = d3
//   .line()
//   .curve(d3.curveNatural)
//   .x((d) => xScale(d.year_parsed))
//   .y((d) => yScale(d.lower_bound));

// const line_upper = d3
//   .line()
//   .curve(d3.curveNatural)
//   .x((d) => xScale(d.year_parsed))
//   .y((d) => yScale(d.upper_bound));

const area_lower = d3
  .area()
  .curve(d3.curveCardinal)
  .x((d) => xScale(d.year_parsed))
  .y0((d) => yScale(d.lower_bound))
  .y1((d) => yScale(d.avg));

const area_upper = d3
  .area()
  .curve(d3.curveCardinal)
  .x((d) => xScale(d.year_parsed))
  .y0((d) => yScale(d.avg))
  .y1((d) => yScale(d.upper_bound));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
//  data (d3.csv)

let data = [];
let lastValue;
let path, circle;

d3.json("data/global_temp_data.json").then((raw_data) => {
  data = raw_data.map((d) => {
    d.year_parsed = parseTime(d.year);
    return d;
  });

  console.log(raw_data);
  // console.log(data[data.length - 1]);
  // console.log(data.length);

  // scale
  xScale.domain(d3.extent(data, (d) => d.year_parsed));
  yScale.domain([-0.8, 1]);

  // console.log(d3.extent(data, (d) => d.year_parsed));
  // console.log(d3.extent(data, (d) => d.upper_bound));

  // axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  //path
  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area_lower)
    .attr("fill", "black")
    .attr("opacity", 0.1);

  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area_upper)
    .attr("fill", "black")
    .attr("opacity", 0.2);

  path = svg
    .append("path")
    .datum(data)
    .attr("d", line_avg)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.5)
    .attr("stroke-width", 1);

  //last value
  lastValue = data[data.length - 1];
  // console.log(lastValue);

  // d3.select("#price").text(formatPrice(lastValue.price));
  // d3.select("#date").text(formatDate(lastValue.date_parsed));

  circle = svg
    .append("circle")
    .attr("cx", xScale(lastValue.year_parsed))
    .attr("cy", yScale(lastValue.avg))
    .attr("r", 3)
    .attr("fill", "black");
});

//resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  // console.log(width);

  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  line.x((d) => xScale(d.year_parsed)).y((d) => yScale(d.avg));
  // area_lower.x((d) => xScale(d.year_parsed)).y((d) => yScale(d.avg));
  // area_upper.x((d) => xScale(d.year_parsed)).y((d) => yScale(d.avg));

  path.attr("d", line_avg);

  circle
    .attr("cx", xScale(lastValue.year_parsed))
    .attr("cy", yScale(lastValue.avg));

  d3.select(".x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  yAxis.tickSize(-width + margin.right + margin.left);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);
});
