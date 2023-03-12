import rawData from './data';
import * as d3 from 'd3';
import * as htl from 'htl';

export const compress = (yearlyData) => {
    return {
        date: new Date(yearlyData.start),
        value: yearlyData.sequence.reduce((acc, curr) => acc + curr, 0),
    };
};
export const makeChartNode = (weatherData, threshold) => {
    const margin = ({top: 20, right: 30, bottom: 30, left: 40});
    const height = 240;
    const width = 640;

    const thresholdData = weatherData.map(wd => ({date: wd.date, value: threshold}));

    const x = d3
        .scaleUtc()
        .domain(d3.extent(weatherData, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(weatherData, d => d.value)])
        .range([height - margin.bottom, margin.top]);

    const line = d3
        .line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select('.domain').remove());

    return htl.svg`<svg viewBox='0 0 ${width} ${height}'>
      <path d='${line(weatherData)}' fill='none' stroke='#226398' stroke-width='1.5' stroke-miterlimit='1'></path>
      <path d='${line(thresholdData)}' fill='none' stroke='#d47024' stroke-width='1.5' stroke-miterlimit='1'></path>
      ${weatherData.map(d => htl.svg`<circle cx='${x(d.date)}' cy='${y(d.value)}' r='2' fill='#226398'>`)}
      ${d3.select(htl.svg`<g>`).call(xAxis).node()}
      ${d3.select(htl.svg`<g>`).call(yAxis).node()}
    </svg>`;
};
document.addEventListener('DOMContentLoaded', () => {
    const data = rawData.map(rd => compress(rd));
    const chart = makeChartNode(data, 70);
    const ele = document.getElementById('chart');
    ele.appendChild(chart);
});
