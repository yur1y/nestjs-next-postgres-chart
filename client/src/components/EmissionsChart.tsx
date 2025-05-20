import { useState } from "react";
import { getEmissionsData, DataSource } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export const EmissionsChart = () => {
  const [year, setYear] = useState("2024");
  const [dataSource, setDataSource] = useState<DataSource>("real");

  const { data, isLoading } = useQuery({
    queryKey: ["emissions", year, dataSource],
    queryFn: () => getEmissionsData(Number(year), dataSource),
  });

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "spline",
      height: "500px",
    },
    title: {
      text: "Vessel Emissions Deviations",
      style: { fontSize: "20px" },
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Quarter End Dates",
        style: { fontSize: "14px" },
      },
      labels: {
        format: "{value:%Q/%Y}",
        rotation: 0,
      },
      tickInterval: 24 * 3600 * 1000 * 30 * 3, // 3 months interval
    },
    yAxis: {
      title: {
        text: "Deviation from Baseline (%)",
        style: { fontSize: "14px" },
      },
      labels: {
        format: "{value}%",
      },
      gridLineWidth: 1,
    },
    tooltip: {
      shared: true,
      crosshairs: true,
      headerFormat: "<b>{point.x:%B %e, %Y}</b><br/>",
      pointFormat:
        '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}%</b><br/>',
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
        },
        lineWidth: 2,
      },
    },
    colors: [
      "#2caffe",
      "#544fc5",
      "#00e272",
      "#fe6a35",
      "#6b8abc",
      "#d568fb",
      "#2ee0ca",
      "#fa4b42",
    ],
    series:
      data?.map((vessel) => ({
        type: "spline",
        name: vessel.vesselName,
        data: vessel.deviations.map((d) => ({
          x: new Date(d.date).getTime(),
          y: Number(d.deviation.toFixed(2)),
          actual: d.actual,
          baseline: d.baseline,
        })),
      })) || [],
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: {
        fontSize: "12px",
      },
    },
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-3">
            <label htmlFor="yearSelect" className="form-label">
              Select Year
            </label>
            <select
              id="yearSelect"
              className="form-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="dataSourceSelect" className="form-label">
              Data Source
            </label>
            <select
              id="dataSourceSelect"
              className="form-select"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as DataSource)}
            >
              <option value="real">Real Data</option>
              <option value="dummy">Demo Data</option>
            </select>
          </div>
        </div>

        <div className="position-relative" style={{ minHeight: "500px" }}>
          {isLoading ? (
            <div className="position-absolute top-50 start-50 translate-middle">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
};