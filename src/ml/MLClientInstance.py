from threading import Thread

from ANN import ANN

from ClientCalls.GeneralCalls import *
from ClientCalls.DatasetCalls import *
from ClientCalls.VersionControllCalls import *
from ClientCalls.DataAccessCalls import *
from ClientCalls.DataManipulationCalls import *
from ClientCalls.DataAnalysisCalls import *
from ClientCalls.DataVisualizationCalls import *
from ClientCalls.ModelCalls import *
from ClientCalls.NetworkCalls import *

class MLClientInstance(Thread):
    
    def setupConnection(self, connection) -> None:
        self.connection = connection
        self.token = ""
        self.experiment_id = 1
    
    def run(self) -> None:
        super().run()
        
        self.network = ANN()
        
        calls = {
            # General calls
            'SetToken' : select_token,
            
            # Dataset calls
            'IsDataLoaded'         : is_dataset_loaded,
            'LoadData'             : load_dataset,
            'LoadTestData'         : load_test_data,
            'SaveDataset'          : save_dataset,
            'SelectInputs'         : select_inputs,
            'SelectOutputs'        : select_outputs,
            'RandomTrainTestSplit' : random_train_test_split,
            'ToggleColumnType'     : toggle_column_type,
            
            # Version controll calls
            'Undo' : undo,
            'Redo' : redo,
            
            # Data access calls
            'GetRows'        : get_rows,
            'GetColumns'     : get_columns,
            'GetRowCount'    : get_row_count,
            'GetColumnTypes' : get_column_types,
            
            # Data manipulation calls
            'AddRow'                : add_row,
            'AddRowToTest'          : add_row_to_test,
            'UpdateRow'             : update_row,
            'DeleteRows'            : delete_row,
            'AddColumn'             : add_column,
            'UpdateColumn'          : update_column,
            'RenameColumn'          : rename_column,
            'UpdateAndRenameColumn' : update_and_rename_column,
            'DeleteColumn'          : delete_column,
            'UpdateValue'           : update_value,
            
            'EmptyStringToNA'      : empty_string_to_na,
            'ZeroToNA'             : zero_to_na,
            'DropNAListwise'       : drop_na_listwise,
            'DropNAPairwise'       : drop_na_pairwise,
            'DropNAColumns'        : drop_na_columns,
            'FillNAWithMean'       : fill_na_with_mean,
            'FillNAWithMedian'     : fill_na_with_median,
            'FillNAWithMode'       : fill_na_with_mode,
            'FillNAWithRegression' : fill_na_with_regression,
            
            'LabelEncoding'  : label_encoding,
            'OneHotEncoding' : one_hot_encoding,
            
            'ScaleAbsoluteMax' : scale_absolute_max,
            'ScaleMinMax'      : scale_min_max,
            'ScaleZScore'      : scale_z_score,
            
            'RemoveOutliersStandardDeviation' : remove_outliers_standard_deviation,
            'RemoveOutliersQuantiles'         : remove_outliers_quantiles,
            'RemoveOutliersZScore'            : remove_outliers_z_score,
            'RemoveOutliersIQR'               : remove_outliers_iqr,
            'RemoveOutliersIsolationForest'   : remove_outliers_isolation_forest,
            'RemoveOutliersOneClassSVM'       : remove_outliers_one_class_svm,
            'RemoveOutliersByLocalFactor'     : remove_outliers_by_local_factor,
            
            # Data analysis calls
            'NumericalStatistics'   : numerical_statistics,
            'CategoricalStatistics' : categorical_statistics,
            'AllStatistics'         : all_statistics,
            
            # Data visualization calls
            'DrawScatterPlot' : draw_scatter_plot,
            'DrawBoxPlot'     : draw_box_plot,
            'DrawViolinPlot'  : draw_violin_plot,
            'DrawBarPlot'     : draw_bar_plot,
            'DrawHistogram'   : draw_histogram,
            'DrawHexbin'      : draw_hexbin,
            'DrawDensityPlot' : draw_density_plot,
            'DrawPiePlot'     : draw_pie_plot,
            
            # Model calls
            'SaveModel' : save_model,
            'LoadModel' : load_model,
            'LoadEpoch' : load_epoch,
            
            # Network calls
            'ComputeMetrics'    : compute_metrics,
            'ChangeSettings'    : change_settings,
            'SelectTraningData' : select_traning_data,
            'Start'             : start
        }
        
        while True:
            # Receive command
            command = self.connection.receive()
            
            # Execute command
            calls[command](self)
        
    def report_error(self, message):
        print(message, flush=True)
        self.connection.send(message)
    
    def parse_columns(self, columns_string):
        if columns_string == '':
            self.report_error("ERROR :: No columns given.")
            return None
        
        columns = [int(x) for x in columns_string.split(":")]
        if not self.network.data.columns_are_valid(columns):
            self.report_error("ERROR :: Illegal columns given.")
            return None
        
        return columns