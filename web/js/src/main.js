let Vue = require("vue");
let axios = require("axios");
let config = require("./config");

axios.defaults.baseURL = config.base;

new Vue({
    el: "#app",
    data() {
        return {
            // general
            isLoading: false,
            errors: [],

            // Structure Pane
            schemas: [],

            // Query Builder Pane
            base: "SELECT $col, count($col) as count FROM $schema.$table WHERE 1 = 1 $where GROUP BY $col $option;",
            expType: ["AND", "OR"],
            wheres: [{
                exp: "",
                criteria: ""
            }],

            // Query Pane
            query: "SELECT request_ip, count(request_ip) as count FROM loganalyzer.logs_gcms_boss_info_elb  GROUP BY request_ip LIMIT 10;",
            option: "LIMIT 10",

            // Result Pane
            isSubmitted: false,
            headers: [],
            result: [],

            // Data Params Pane
            column: "",
            x: "",
            y1: "",
            y2: "",

            // Data Graph Pane
            graph: "",
            graphType: ["line", "bar"]
        }
    },
    created() {
        this.isLoading = true;
        axios.get("structure")
            .then((response) => {
                this.schemas = response.data.schemas;
                this.isLoading = false;
            }).catch((error) => {
                this.errors.push(error);
                this.isLoading = false;
            })
    },
    methods: {
        addWhere() {
            this.wheres.push({
                exp: "",
                criteria: ""
            });
        },
        build() {
            let cols = this.column.split('.');
            const schema = cols[0];
            const table = cols[1];
            const column = cols[2];

            let where = '';
            this.wheres.forEach((value) => {
                if (value.exp != "" && value.criteria != "") {
                    where += " " + value.exp + " " + value.criteria;
                }
            });

            this.query = this.base
                .replace('$schema', schema)
                .replace('$table', table)
                .replace('$col', column)
                .replace('$col', column)
                .replace('$col', column)
                .replace('$where', where)
                .replace('$option', this.option)
        },
        submit() {
            this.isLoading = true;
            this.isSubmitted = false;

            axios.post("query", {
                query: this.query
            })
                .then((response) => {
                    this.result = [];
                    this.headers = [];
                    let result = response.data;

                    if (result.errorMessage) {
                        this.errors.push(result.errorMessage);
                        this.isLoading = false;
                        return;
                    }

                    if (result.length > 0) {
                        let columns = result[0].columns;
                        // headerを構築
                        for (let i in columns) {
                            let column = columns[i];
                            this.headers.push(column.name);
                        }

                        // 配列を再構築
                        for (let i in result) {
                            let columns = result[i].columns;
                            let row = {};
                            for (let j in columns) {
                                let column = columns[j];
                                row[column.name] = column.value;
                            }
                            this.result.push(row);
                        }
                    }

                    this.isLoading = false;
                    this.isSubmitted = true;
                })
                .catch((error) => {
                    this.errors.push(error);
                    this.isLoading = false;
                })
        },
        showGraph() {
            if (this.x.length > 0) {
                let labels = [];
                let datasets = [];

                for (let i in this.result) {
                    labels.push(this.result[i][this.x]);
                }

                if (this.y1.length > 0) {
                    let dataset = {
                        label: this.y1,
                        fillColor: "rgba(210, 214, 222, 1)",
                        strokeColor: "rgba(210, 214, 222, 1)",
                        pointColor: "rgba(210, 214, 222, 1)",
                        pointStrokeColor: "#c1c7d1",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: []
                    };

                    for (let i in this.result) {
                        dataset.data.push(this.result[i][this.y1]);
                    }

                    datasets.push(dataset);
                }

                if (this.y2.length > 0) {
                    let dataset2 = {
                        label: this.y2,
                        fillColor: "rgba(60,141,188,0.9)",
                        strokeColor: "rgba(60,141,188,0.8)",
                        pointColor: "#3b8bba",
                        pointStrokeColor: "rgba(60,141,188,1)",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(60,141,188,1)",
                        data: []
                    };

                    for (let i in this.result) {
                        dataset2.data.push(this.result[i][this.y2]);
                    }

                    datasets.push(dataset2);
                }

                const data = {
                    labels: labels,
                    datasets: datasets
                };

                const options = {
                    showScale: true,
                    scaleShowGridLines: false,
                    scaleGridLineColor: "rgba(0,0,0,.05)",
                    scaleGridLineWidth: 1,
                    scaleShowHorizontalLines: true,
                    scaleShowVerticalLines: true,
                    bezierCurve: true,
                    bezierCurveTension: 0.3,
                    pointDot: false,
                    pointDotRadius: 4,
                    pointDotStrokeWidth: 1,
                    pointHitDetectionRadius: 20,
                    datasetStroke: true,
                    datasetStrokeWidth: 2,
                    datasetFill: false,
                    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
                    maintainAspectRatio: true,
                    responsive: true
                };

                let canvas = $("#chart").get(0).getContext("2d");
                let chart = new Chart(canvas);
                switch (this.graph) {
                    case 'line':
                        chart.Line(data, options);
                        break;
                    case 'bar':
                        chart.Bar(data, options);
                }
            }
        }
    }
});