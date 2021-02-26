import "./styles.css";
import * as d3 from "d3";

document.getElementById(
  "app"
).innerHTML = `<h1 id="title">Monthly Global Land-Surface Temperature</h1>
<p id="description">Data from 1753 to 2015</p>`;

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((data) => {
    const baseTemperature = data.baseTemperature;
    const dataset = data.monthlyVariance;
    const parseYear = d3.timeParse("%Y");
    const parseMonth = d3.timeParse("%m");

    const padding = 80;
    const cellWidth = 5;
    const cellHeight = 40;
    const width =
      (d3.max(dataset, (d) => d.year) - d3.min(dataset, (d) => d.year)) *
        cellWidth +
      2 * padding;
    const height =
      (d3.max(dataset, (d) => d.month) - d3.min(dataset, (d) => d.month) + 1) *
        cellHeight +
      2 * padding;

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, (d) => parseYear(d.year)))
      .range([padding, width - padding]);

    const yScale = d3
      .scaleBand()
      .domain(
        dataset.map((item) => {
          return parseMonth(item.month);
        })
      )
      .range([padding, height - padding]);

    const svg = d3
      .select("#app")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg
      .selectAll("cells")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(parseYear(d.year)))
      .attr("y", (d) => yScale(parseMonth(d.month)))
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemperature + d.variance)
      .attr("fill", (d) => {
        let temperature = baseTemperature + d.variance;
        return temperature < 2
          ? d3.interpolateRdYlBu((1 / 7) * 7)
          : temperature < 4
          ? d3.interpolateRdYlBu((1 / 7) * 6)
          : temperature < 6
          ? d3.interpolateRdYlBu((1 / 7) * 5)
          : temperature < 8
          ? d3.interpolateRdYlBu((1 / 7) * 4)
          : temperature < 10
          ? d3.interpolateRdYlBu((1 / 7) * 3)
          : temperature < 12
          ? d3.interpolateRdYlBu((1 / 7) * 2)
          : d3.interpolateRdYlBu((1 / 7) * 1);
      })
      .on("mouseover", (e, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(
              new Date(1900, d.month - 1)
            )}<br>Temperature: ${(baseTemperature + d.variance).toFixed(
              1
            )} ℃<br>Variance: ${d.variance.toFixed(1)} ℃`
          )
          .attr("data-year", d.year);
      })
      .on("mouseout", (e, d) => {
        d3.select("#tooltip").style("opacity", 0);
      })
      .on("mousemove", (e, d) => {
        d3.select("#tooltip")
          .style("left", `${e.pageX + 20}px`)
          .style("top", `${e.pageY}px`);
      });

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - padding})`)
      .attr("id", "x-axis")
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${padding}, 0)`)
      .attr("id", "y-axis")
      .call(yAxis);

    svg
      .append("text")
      .text("Year")
      .attr("x", width / 2)
      .attr("y", height);

    d3.select("#app")
      .append("div")
      .attr("id", "tooltip")
      .attr("style", "position: absolute; opacity: 0;");

    const colors = [
      d3.interpolateRdYlBu((1 / 7) * 7),
      d3.interpolateRdYlBu((1 / 7) * 6),
      d3.interpolateRdYlBu((1 / 7) * 5),
      d3.interpolateRdYlBu((1 / 7) * 4),
      d3.interpolateRdYlBu((1 / 7) * 3),
      d3.interpolateRdYlBu((1 / 7) * 2),
      d3.interpolateRdYlBu((1 / 7) * 1)
    ];
    const temperatures = ["<2", "<4", "<6", "<8", "<10", "<12", ">12", "℃"];

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `${padding}, ${height + padding - 40}`);

    legend
      .append("g")
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .style("fill", (d) => d)
      .attr("x", (d, i) => 200 + i * 40)
      .attr("y", height - 50)
      .attr("width", 20)
      .attr("height", 20);

    legend
      .append("g")
      .selectAll("text")
      .data(temperatures)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", (d, i) => 200 + i * 40)
      .attr("y", height - 10);
  });
