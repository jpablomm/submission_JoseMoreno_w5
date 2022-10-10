const width = 530;
const height = 500;
const margins = {
  top: 10,
  bottom: 50,
  left: 30,
  right: 10,
};

d3.csv("data/zaatari-refugee-camp-population.csv", (row) => {
  return {
    date: new Date(row.date),
    population: parseFloat(row.population),
  };
}).then((data) => {
  createAreaChart(data);
  createBarChart(data);
});

function createAreaChart(data) {
  // DEFINE SCALES
  const populationArray = data.map((item) => item.population);
  const datesArray = data.map((item) => item.date);

  const populationScale = d3
    .scaleLinear()
    .domain([0, d3.max(populationArray)])
    .range([height - margins.top - margins.bottom, margins.top]);

  const datesScale = d3
    .scaleTime()
    .domain(d3.extent(datesArray))
    .range([margins.left, width - margins.left - margins.right]);

  const yAxis = d3.axisLeft(populationScale);
  const xAxis = d3.axisBottom(datesScale).tickFormat(d3.timeFormat("%b %Y"));

  // DRAW SVG CONTAINERS
  const svg = d3
    .select("#line-chart-area")
    .append("svg")
    .attr("width", `${width}px`)
    .attr("height", `${height}px`);

  const innerChart = svg
    .append("g")
    .attr("class", "innerChart")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  // DRAW SCALES
  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margins.left + 29},${margins.top})`)
    .call(yAxis);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(${margins.left},${height - margins.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("y", 5)
    .attr("x", 30)
    .attr("transform", "rotate(50)");

  // DRAW LINE
  const lineGenerator = d3
    .line()
    .x((d) => datesScale(d.date))
    .y((d) => populationScale(d.population));

  innerChart
    .append("path")
    .attr("d", lineGenerator(data))
    .attr("fill", "none")
    .attr("stroke", "#784D3C")
    .attr("stroke-width", "4px");

  const areaGenerator = d3
    .area()
    .x((d) => datesScale(d.date))
    .y0((d) => populationScale(0))
    .y1((d) => populationScale(d.population));

  innerChart
    .append("path")
    .attr("d", areaGenerator(data))
    .attr("fill", "#CEAF99");

  // DRAW LABEL
  svg
    .append("text")
    .text("Camp Population")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", margins.top + 10);

  // CREATE TOOLTIP
  const tooltip = innerChart
    .append("g")
    .attr("id", "tooltip-group")
    .classed("hidden", true);

  // CREATE HELPER FUNCTIONS
  let bisectDate = d3.bisector((d) => d.date).left;
  const formatTime = d3.timeFormat("%Y-%b-%d");
  const formatNumber = d3.format(",.2r");
  function showTooltip(event, datum) {
    d3.select("#tooltip-group").classed("hidden", false);
    const [x, y] = d3.pointer(event);
    let dateValue = datesScale.invert(x);
    let populationIndex = bisectDate(data, dateValue);
    let populationValue = data[populationIndex].population;

    d3.select("#tooltip-line").attr("x1", x).attr("x2", x);
    d3.select("#tooltip-population")
      .text(formatNumber(populationValue))
      .attr("x", x + 5);
    d3.select("#tooltip-date")
      .text(formatTime(dateValue))
      .attr("x", x + 5);
    d3.select("#tooltip-circle")
      .attr("cx", datesScale(dateValue))
      .attr("cy", populationScale(populationValue));
  }
  function hideTooltip() {
    d3.select("#tooltip-group").classed("hidden", true);
  }

  tooltip
    .append("line")
    .attr("id", "tooltip-line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 200)
    .attr("y2", height - margins.bottom - margins.top)
    .attr("stroke", "red");

  tooltip
    .append("text")
    .attr("id", "tooltip-population")
    .attr("x", 0)
    .attr("y", 35);
  tooltip.append("text").attr("id", "tooltip-date").attr("x", 0).attr("y", 55);
  tooltip
    .append("circle")
    .attr("id", "tooltip-circle")
    .attr("r", 3)
    .attr("fill", "white");

  const eventSpace = innerChart
    .append("rect")
    .attr("x", 30)
    .attr("width", width - margins.left - margins.right - 30)
    .attr("height", height - margins.top - margins.bottom)
    .attr("fill", "black")
    .style("opacity", 0);
  eventSpace.on("mouseover", showTooltip);
  eventSpace.on("mousemove", showTooltip);
  eventSpace.on("mouseout", hideTooltip);
}

function createBarChart(data) {
  const formattedData = [
    {
      type: "Caravans",
      amount: 78.68,
    },
    {
      type: "Combination*",
      amount: 10.81,
    },
    {
      type: "Tents",
      amount: 9.51,
    },
  ];

  // CREATE SCALES
  const percentageScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([margins.top, height - margins.top - margins.bottom]);

  const percentageScaleAxis = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margins.top - margins.bottom, margins.top]);

  const typeScale = d3
    .scaleBand()
    .domain(formattedData.map((item) => item.type))
    .range([margins.left, width - margins.left - margins.right]);

  const yAxis = d3.axisLeft(percentageScaleAxis).tickFormat((d) => `${d}%`);
  const xAxis = d3.axisBottom(typeScale);

  // CREATE SVG
  const svg = d3
    .select("#bar-chart-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // DRAW AXIS
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .attr("transform", `translate(${margins.left + 30}, ${margins.top})`);

  svg
    .append("g")
    .attr("class", "x-axis")
    .call(xAxis)
    .attr(
      "transform",
      `translate(${margins.left}, ${height - margins.bottom})`
    );

  // DRAW CHART
  const innerChart = svg
    .append("g")
    .attr("class", "bar-chart")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  const barGap = 20;
  const innerChartWidth = width - margins.left - margins.right;
  const innerChartHeight = height - margins.top - margins.bottom;
  const barWidth = innerChartWidth / 3 - barGap * 2;

  innerChart
    .selectAll("rect.bar")
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => barGap + typeScale(d.type))
    .attr("y", (d) => innerChartHeight - percentageScale(d.amount))
    .attr("height", (d) => percentageScale(d.amount))
    .attr("width", barWidth)
    .attr("fill", "#CEAF99");

  // DRAW LABELS
  svg
    .selectAll("text.pct-label")
    .data(formattedData)
    .enter()
    .append("text")
    .attr("class", "pct-label")
    .text((d) => `${d.amount}%`)
    .attr(
      "x",
      (d, i) => margins.left + barGap + barWidth / 2 + typeScale(d.type)
    )
    .attr("y", (d) => innerChartHeight - percentageScale(d.amount))
    .attr("text-anchor", "middle");

  svg
    .append("text")
    .text("Type of Shelter")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", margins.top + 10);

  svg
    .append("text")
    .text("*Households with recorded tent and caravan combinations")
    .attr("x", 50)
    .attr("y", height)
    .style("font-size", "10px");
}
