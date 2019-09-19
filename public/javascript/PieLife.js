 /**
         * PIE CHART by nove
         * options-
         *      canvas - the canvas to draw to
         *      data - json data containing category name and the integer value associated eg. {"Classical Rock": 10, "Pop": 25}
         *      colors - an array of hex colors to be used for each category
         *      legend - the dom element reference to a div to load in the piechart legend automatically
         *      width  - the width in canvas units
         *      height - the height in canvas units
         *      fontColor - the font color desired for labeling each segment
         *      fontSize - the size of the label font 
         *      donutHoleSize - size of the cut out in the pie chart
         *      enableLabels - true turn labels on / false turn labels off
         **/
const Piechart = function(options){
            //set default options
            this.options = {
                                width: 200,
                                height: 200,
                                enableLabels: false,
                                donutHoleSize: 0,
                                legend: null,
                                fontSize: "12px",
                                fontColor: "white"
                            };
            this.canvas = options.canvas;
            this.pieData = options.data;
            this.ctx = this.canvas.getContext("2d");
            this.colors = options.colors || [];
            //Override defaults
            for (let property in options) {
                if (options.hasOwnProperty(property)) {
                    this.options[property] = options[property];
                }
            }
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            this.drawPieSlice = function(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(centerX,centerY);
                    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                    ctx.closePath();
                    ctx.fill();
                }
            this.grabRandomColor = function(){
                return '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
            }
            this.addLegend = function(){
                if (this.options.legend != null){
                    let color_index = 0;
                    var legendHTML = "";
                    for (let category in this.options.data){
                        legendHTML += `<div>
                                        <span style='display:inline-block;width:20px;background-color:${this.colors[color_index++]};'>&nbsp;</span> 
                                        ${category} - ${this.options.data[category]}
                                        </div>`;
                    }
                    this.options.legend.innerHTML = legendHTML;
                }
            }
            this.addLabels = function(sliceVal, total_value, start_angle, slice_angle){
                if(this.options.enableLabels){
                    let pieRadius = Math.min(this.canvas.width/2,this.canvas.height/2);
                    let labelX = this.canvas.width/2 + (pieRadius / 2) * Math.cos(start_angle + slice_angle/2);
                    let labelY = this.canvas.height/2 + (pieRadius / 2) * Math.sin(start_angle + slice_angle/2);
                    if (this.options.donutHoleSize > 0){
                        let offset = (pieRadius * this.options.donutHoleSize ) / 2;
                        labelX = this.canvas.width/2 + (offset + pieRadius / 2) * Math.cos(start_angle + slice_angle/2);
                        labelY = this.canvas.height/2 + (offset + pieRadius / 2) * Math.sin(start_angle + slice_angle/2);               
                    }
                    let labelText = Math.round(100 * sliceVal / total_value);
                    this.ctx.fillStyle = this.options.fontColor;
                    this.ctx.font = `bold ${this.options.fontSize} Arial`;
                    this.ctx.fillText(labelText+"%", labelX,labelY);
                }
            }
            this.makeDonutPie = function(){
                    if (this.options.donutHoleSize != 0){
                        this.drawPieSlice(
                            this.ctx,
                            this.canvas.width/2,
                            this.canvas.height/2,
                            this.options.donutHoleSize * Math.min(this.canvas.width/2,this.canvas.height/2),
                            0,
                            2 * Math.PI,
                            "#fff"
                        );
                    }
           }
            this.draw = function(){
                let total_value = 0;
                let color_index = 0;
                let colorArr = [];
                for (var category in this.pieData){
                    let val = this.pieData[category];
                    if(!this.options.colors){
                        this.colors.push(this.grabRandomColor());
                    }
                    total_value += val;
                }
        
                var start_angle = 0;
                for (category in this.pieData){
                    let sliceVal = this.pieData[category];
                    let slice_angle = 2 * Math.PI * sliceVal / total_value;
        
                    this.drawPieSlice(
                        this.ctx,
                        this.canvas.width/2,
                        this.canvas.height/2,
                        Math.min(this.canvas.width/2,this.canvas.height/2),
                        start_angle,
                        start_angle+slice_angle,
                        this.colors[color_index%this.colors.length]
                    );
                    this.makeDonutPie();
                    this.addLabels(sliceVal, total_value, start_angle, slice_angle);
                    start_angle += slice_angle;
                    color_index++;
                }
                this.addLegend();
            }
        };