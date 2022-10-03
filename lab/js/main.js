// SVG Size
let width = 700,
  height = 500;

// Load CSV file
d3.csv("data/wealth-health-2014.csv", (d) => {
  // TODO: convert values where necessary in this callback (d3.csv reads the csv line by line. In the callback,
  //  you have access to each line (or row) represented as a js object with key value pairs. (i.e. a dictionary).
  d.LifeExpectancy = +d.LifeExpectancy;
  d.Income = +d.Income;
  d.Population = +d.Population;
  return d;
}).then((data) => {
  // Analyze the dataset in the web console
  console.log(data);

  // TODO: sort the data
  const sortedData = data.sort((a, b) => b.Population - a.Population);
  console.log(sortedData);
  // TODO: Call your separate drawing function here, i.e. within the .then() method's callback function
  drawScatter(sortedData);
});

// TODO: create a separate function that is in charge of drawing the data, which means it takes the sorted data as an argument
// function ... (){}
function drawScatter(data) {
  const margins = {
    top: 20,
    bottom: 50,
    left: 50,
    right: 50,
  };

  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  // create scales
  const [minLifeExp, maxLifeExp] = d3.extent(
    data.map((item) => item.LifeExpectancy)
  );

  const [minIncomePerCapita, maxIncomePerCapita] = d3.extent(
    data.map((item) => item.Income)
  );

  const [minPopulation, maxPopulation] = d3.extent(
    data.map((item) => item.Population)
  );
  //   const padding = 20;
  const incomeScale = d3
    .scaleLog()
    .domain([minIncomePerCapita - 100, maxIncomePerCapita])
    .range([0, innerWidth]);

  for (const item of data) {
    // console.log(item);
    if (item.Income < 1) {
      console.log(item);
    }
  }

  const lifeScale = d3
    .scaleLog()
    .domain([minLifeExp - 10, maxLifeExp])
    .range([innerHeight, margins.bottom]);

  const populationScale = d3
    .scaleLinear()
    .domain([minPopulation, maxPopulation])
    .range([4, 30]);

  const colorScale = d3.scaleOrdinal(d3.schemeBlues[9]);
  colorScale.domain(data.map((item) => item.Region));

  // create SVG
  const svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black");

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  // create circles
  innerChart
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", (d, i) => `${i}`)
    .attr("cx", (d) => incomeScale(d.Income))
    .attr("cy", (d) => lifeScale(d.LifeExpectancy))
    .attr("r", (d) => `${populationScale(d.Population)}px`)
    .attr("fill", (d) => colorScale(d.Region))
    .attr("stroke", "black");

  // create axis
  const yAxis = d3.axisLeft(lifeScale);
  const xAxis = d3.axisBottom(incomeScale);

  innerChart.append("g").call(yAxis);
  innerChart
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(${0},${innerHeight})`);

  // create labels
  innerChart
    .append("text")
    .text("Income per Capita")
    .attr("x", innerWidth - 60)
    .attr("y", innerHeight - 10);

  innerChart
    .append("text")
    .text("Life expectancy")
    .attr("x", 0)
    .attr("y", 40)
    .attr("fill", "black");
}
