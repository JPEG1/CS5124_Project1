/*
Script containing some global variables/constants accessed throughout the project.
By storing them here, we only have to change them in this one location, and they'll update throughout the entire project.
*/
const RURAL_COLOR = "#B3E5FC";
const SUBURBAN_COLOR = "#4FC3F7";
const SMALL_CITY_COLOR = "#03A9F4";
const URBAN_COLOR = "#0288D1";

var currVisNumber = 1;
var selectedXAxis = "percent_inactive";
var selectedYAxis = "percent_no_health_insurance";

var lstActiveStates = [];

// Globally-accessible class with static attributes (so no instance is required). Usually, I'd move this into it's own .js file
//  This class contains some attributes to display to the tooltip & axes titles.
class TooltipData {
    static xName = "";
    static yName = "";
    static pre_x_unit = "";
    static pre_y_unit = "";
    static post_x_unit = "";
    static post_y_unit = "";
    
    // simple method that clears/resets data (since attributes are all static, so does the function need to be)
    static clear() {
        TooltipData.xName = "";
        TooltipData.yName = "";
        TooltipData.pre_x_unit = "";
        TooltipData.pre_y_unit = "";
        TooltipData.post_x_unit = "";
        TooltipData.post_y_unit = "";
    }
};