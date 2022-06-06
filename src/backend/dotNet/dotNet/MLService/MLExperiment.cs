
using dotNet.Models;

namespace dotNet.MLService {
    public class MLExperiment {
        private readonly MLConnection connection;
        private readonly object _lock = new();

        public MLExperiment(IConfiguration configuration, string token, int experimentId) {
            connection = new MLConnection(configuration);
            SetupUser(token, experimentId);
        }

        public void SetupUser(string token, int experimentId) {
            connection.Send(Command.SetupUser);
            connection.Send(token);
            connection.Send(experimentId);
        }

        // ///////////////// //
        // Data introduction //
        // ///////////////// //
        public bool IsDataLoaded() {
            lock (_lock) {
                connection.Send(Command.IsDataLoaded);
                var loaded = connection.Receive();
                if (loaded != null && loaded.Equals("True"))
                    return true;
                else if (loaded != null && loaded.Equals("False"))
                    return false;
                throw new MLException($"ERROR :: Server out of sync. Wrong message received: {loaded}");
            }
        }

        public void LoadDataset(string fileName) {
            lock (_lock) {
                connection.Send(Command.LoadData);
                connection.Send(fileName);
                CheckStatus();
            }
        }

        public void LoadDatasetTest(byte[] data, string fileName) {
            lock (_lock) {
                connection.Send(Command.LoadTestData);
                connection.Send(data);
                connection.Send(fileName);
                CheckStatus();
            }
        }

        public void SaveDataset(string fileName) {
            lock (_lock) {
                connection.Send(Command.SaveDataset);
                connection.Send(fileName);
                CheckStatus();
            }
        }

        public void LoadInputs(int[] inputs) {
            lock (_lock) {
                connection.Send(Command.SelectInputs);
                connection.Send(EncodeIntArray(inputs));
                CheckStatus();
            }
        }

        public void LoadOutputs(int[] outputs) {
            lock (_lock) {
                connection.Send(Command.SelectOutputs);
                connection.Send(EncodeIntArray(outputs));
                CheckStatus();
            }
        }

        public void TrainTestSplit(float ratio) {
            lock (_lock) {
                connection.Send(Command.RandomTrainTestSplit);
                connection.Send(ratio);
                CheckStatus();
            }
        }

        // //////////////////// //
        // Data version control //
        // //////////////////// //

        public void Undo() {
            lock (_lock) {
                connection.Send(Command.Undo);
                CheckStatus();
            }
        }

        public void Redo() {
            lock (_lock) {
                connection.Send(Command.Redo);
                CheckStatus();
            }
        }

        // /////////// //
        // Data access //
        // /////////// //

        public string GetRows(int[] rowIndices) {
            lock (_lock) {
                connection.Send(Command.GetRows);
                connection.Send(EncodeIntArray(rowIndices));
                CheckStatus();
                return connection.Receive();
            }
        }

        public string GetColumns(string datasetVersion) {
            lock (_lock) {
                connection.Send(Command.GetColumns);
                connection.Send(datasetVersion);
                CheckStatus();
                return connection.Receive();
            }
        }

        public int GetRowCount() {
            lock (_lock) {
                connection.Send(Command.GetRowCount);
                return int.Parse(connection.Receive());
            }
        }

        public string GetColumnTypes() {
            lock (_lock) {
                connection.Send(Command.GetColumnTypes);
                return connection.Receive();
            }
        }

        public string ColumnsNumericalCheck() {
            lock (_lock) {
                connection.Send(Command.GetCNumerical);
                return connection.Receive();
            }
        }

        // ///////////////// //
        // Data manipulation //
        // ///////////////// //

        // CRUD operations
        public void AddRow(string[] newRow) {
            lock (_lock) {
                connection.Send(Command.AddRow);
                connection.Send(EncodeStringArray(newRow));
                CheckStatus();
            }
        }

        public void AddRowToTest(string[] newRow) {
            lock (_lock) {
                connection.Send(Command.AddRowToTest);
                connection.Send(EncodeStringArray(newRow));
                CheckStatus();
            }
        }

        public void UpdateRow(int rowIndex, string[] rowValues) {
            lock (_lock) {
                connection.Send(Command.UpdateRow);
                connection.Send(rowIndex);
                connection.Send(EncodeStringArray(rowValues));
                CheckStatus();
            }
        }

        public void DeleteRows(int[] rows) {
            lock (_lock) {
                connection.Send(Command.DeleteRows);
                connection.Send(EncodeIntArray(rows));
                CheckStatus();
            }
        }

        public void AddColumn(string columnName, string[] column) {
            lock (_lock) {
                connection.Send(Command.AddColumn);
                connection.Send(EncodeStringArray(column));
                connection.Send(columnName);
            }
        }

        public void UpdateColumn(int columnIndex, string[] columnValues) {
            lock (_lock) {
                connection.Send(Command.UpdateColumn);
                connection.Send(columnIndex);
                connection.Send(EncodeStringArray(columnValues));
            }
        }

        public void RenameColumns(int columnIndex, string columnName) {
            lock (_lock) {
                connection.Send(Command.RenameColumn);
                connection.Send(columnIndex);
                connection.Send(columnName);
            }
        }

        public void ReplaceColumn(int columnIndex, string newColumnName, string[] newColumnValues) {
            lock (_lock) {
                connection.Send(Command.UpdateAndRenameColumn);
                connection.Send(columnIndex);
                connection.Send(EncodeStringArray(newColumnValues));
                connection.Send(newColumnName);
            }
        }

        public void DeleteColumns(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DeleteColumns);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void UpdataValue(int row, int column, object value) {
            lock (_lock) {
                connection.Send(Command.UpdateValue);
                connection.Send(row);
                connection.Send(column);
                connection.Send(value);
                CheckStatus();
            }
        }

        // Replace with NA
        public void ReplaceEmptyWithNA(int[] columns) {
            lock (_lock) {
                connection.Send(Command.EmptyStringToNA);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void ReplaceZeroWithNA(int[] columns) {
            lock (_lock) {
                connection.Send(Command.ZeroToNA);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        // Drop NA values
        public void DropNAListwise() {
            lock (_lock) {
                connection.Send(Command.DropNAListwise);
            }
        }

        public void DropNAPairwise(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DropNAPairwise);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void DropNAColumns() {
            lock (_lock) {
                connection.Send(Command.DropNAColumns);
            }
        }

        // Fill NA values
        public void FillNAWithValue(int column, string value) {
            lock (_lock) {
                connection.Send(Command.FillNAWithValue);
                connection.Send(column);
                connection.Send(value);
                CheckStatus();
            }
        }

        public void FillNAWithMean(int[] columns) {
            lock (_lock) {
                connection.Send(Command.FillNAWithMean);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void FillNAWithMedian(int[] columns) {
            lock (_lock) {
                connection.Send(Command.FillNAWithMedian);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void FillNAWithMode(int[] columns) {
            lock (_lock) {
                connection.Send(Command.FillNAWithMode);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }
        public void FillNAWithRegression(int naColumn, int[] inputColumns) {
            lock (_lock) {
                connection.Send(Command.FillNAWithRegression);
                connection.Send(naColumn);
                connection.Send(EncodeIntArray(inputColumns));
                CheckStatus();
            }
        }

        // Encoding
        public void OneHotEncoding(int[] columns) {
            lock (_lock) {
                connection.Send(Command.OneHotEncoding);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void LabelEncoding(int[] columns) {
            lock (_lock) {
                connection.Send(Command.LabelEncoding);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        // Normalization
        public void ScaleAbsoluteMax(int[] columns) {
            lock (_lock) {
                connection.Send(Command.ScaleAbsoluteMax);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void ScaleMinMax(int[] columns) {
            lock (_lock) {
                connection.Send(Command.ScaleMinMax);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void ScaleZScore(int[] columns) {
            lock (_lock) {
                connection.Send(Command.ScaleZScore);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        // Outliers
        public void RemoveOutliersStandardDeviation(int[] columns, float threshold) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersStandardDeviation);
                connection.Send(EncodeIntArray(columns));
                connection.Send(threshold);
                CheckStatus();
            }
        }

        public void RemoveOutliersQuantiles(int[] columns, float threshold) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersQuantiles);
                connection.Send(EncodeIntArray(columns));
                connection.Send(threshold);
                CheckStatus();
            }
        }

        public void RemoveOutliersZScore(int[] columns, float threshold) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersZScore);
                connection.Send(EncodeIntArray(columns));
                connection.Send(threshold);
                CheckStatus();
            }
        }

        public void RemoveOutliersIQR(int[] columns) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersIQR);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void RemoveOutliersIsolationForest(int[] columns) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersIsolationForest);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void RemoveOutliersOneClassSVM(int[] columns) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersOneClassSVM);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void RemoveOutliersByLocalFactor(int[] columns) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersByLocalFactor);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        // ///////////// //
        // Data analysis //
        // ///////////// //


        // Change column type
        public void ToggleColumnsType(int columns) {
            lock (_lock) {
                connection.Send(Command.ToggleColumnType);
                connection.Send(columns);
                CheckStatus();
            }
        }

        // Get column statistics
        public string NumericalStatistics(int[] columns) {
            lock (_lock) {
                connection.Send(Command.NumericalStatistics);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
                return connection.Receive();
            }
        }

        public string CategoricalStatistics(int[] columns) {
            lock (_lock) {
                connection.Send(Command.CategoricalStatistics);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
                return connection.Receive();
            }
        }

        public string ColumnStatistics() {
            lock (_lock) {
                connection.Send(Command.AllStatistics);
                return connection.Receive();
            }
        }

        // Data visualization
        public void DrawScatterPlot(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawScatterPlot);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void DrawBoxPlot(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawBoxPlot);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }
        public void DrawViolinPlot(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawViolinPlot);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }
        public void DrawBarPlot(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawBarPlot);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }
        public void DrawHistogram(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawHistogram);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }
        public void DrawHexbin(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawHexbin);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void DrawDensityPlot(int[] columns) {
            lock (_lock) {
                connection.Send(Command.DrawDensityPlot);
                connection.Send(EncodeIntArray(columns));
                CheckStatus();
            }
        }

        public void DrawPiePlot(int column) {
            lock (_lock) {
                connection.Send(Command.DrawPiePlot);
                connection.Send(column);
                CheckStatus();
            }
        }

        // /////// //
        // Network //
        // /////// //

        // Saving and loading ANN models
        public void SaveModel(string modelName, int modelId = -1) {
            lock (_lock) {
                connection.Send(Command.SaveModel);
                connection.Send(modelName);
                connection.Send(modelId);
                CheckStatus();
            }
        }

        public void LoadModel(string modelName, int modelId) {
            lock (_lock) {
                connection.Send(Command.LoadModel);
                connection.Send(modelName);
                connection.Send(modelId);
                CheckStatus();
            }
        }

        public void LoadEpoch(string epoch) {
            lock (_lock) {
                connection.Send(Command.LoadEpoch);
                connection.Send(epoch);
                CheckStatus();
            }
        }

        public void MergeModels(int ModelIdFrom, int ModelIdInto) {
            lock (_lock) {
                connection.Send(Command.MergeMIds);
                connection.Send(ModelIdFrom);
                connection.Send(ModelIdInto);
                CheckStatus();
            }
        }

        public string GetWeights() {
            lock (_lock) {
                connection.Send(Command.GetWeight);
                return connection.Receive();
            }
        }

        // Working with ANN-s
        public string ComputeMetrics(int modelId = -1) {
            lock (_lock) {
                connection.Send(Command.ComputeMetrics);
                connection.Send(modelId);
                CheckStatus();
                return connection.Receive();
            }
        }

        public void ApplySettings(ANNSettings annSettings) {
            lock (_lock) {
                connection.Send(Command.ChangeSettings);
                connection.Send(annSettings);
            }
        }

        public void CreateNewNetwork() {
            lock (_lock) {
                connection.Send(Command.CreateNewNetwork);
                CheckStatus();
            }
        }

        public void SelectTrainingData(string datasetVersion) {
            lock (_lock) {
                connection.Send(Command.SelectTrainingData);
                connection.Send(datasetVersion);
                CheckStatus();
            }
        }

        public void Start(int modelId = -1) {
            lock (_lock) {
                connection.Send(Command.Start);
                connection.Send(modelId);
                CheckStatus();
            }
        }

        public void Stop(int modelId) {
            lock (_lock) {
                connection.Send(Command.Stop);
                connection.Send(modelId);
                CheckStatus();
            }
        }

        public void Continue(int modelId, int numberOfEpoch, float learningRate) {
            lock (_lock) {
                connection.Send(Command.Continue);
                connection.Send(modelId);
                connection.Send(numberOfEpoch);
                connection.Send(learningRate);
                CheckStatus();
            }
        }

        public void Dismiss(int modelId) {
            lock (_lock) {
                connection.Send(Command.Dismiss);
                connection.Send(modelId);
                CheckStatus();
            }
        }

        public string Predict(string[] inputs, int modelId = -1) {
            lock (_lock) {
                connection.Send(Command.Predict);
                connection.Send(EncodeStringArray(inputs));
                connection.Send(modelId);
                CheckStatus();
                return connection.Receive();
            }
        }

        // Helper functions
        private static string EncodeIntArray(int[] arrray) {
            if (arrray == null || arrray.Length == 0)
                return "";
            string o = $"{arrray[0]}";
            for (int i = 1; i < arrray.Length; i++)
                o += $":{arrray[i]}";
            return o;
        }

        private static string EncodeStringArray(string[] array) {
            if (array == null)
                array = Array.Empty<string>();
            return Newtonsoft.Json.JsonConvert.SerializeObject(new { Data = array });
        }

        private void CheckStatus() {
            string response = connection.Receive();
            if (response != "OK")
                throw new MLException(response);
        }
    }

    public enum Command {
        SetupUser,
        // Data introduction
        IsDataLoaded,
        LoadData,
        LoadTestData,
        SaveDataset,
        SelectInputs,
        SelectOutputs,
        RandomTrainTestSplit,
        // Data version control
        Undo,
        Redo,
        // Data access
        GetRows,
        GetColumns,
        GetRowCount,
        GetColumnTypes,
        GetCNumerical,
        // Data manipulation
        AddRow,
        AddRowToTest,
        UpdateRow,
        DeleteRows,
        AddColumn,
        UpdateColumn,
        RenameColumn,
        UpdateAndRenameColumn,
        DeleteColumns,
        UpdateValue,
        EmptyStringToNA,
        ZeroToNA,
        DropNAListwise,
        DropNAPairwise,
        DropNAColumns,
        FillNAWithValue,
        FillNAWithMean,
        FillNAWithMedian,
        FillNAWithMode,
        FillNAWithRegression,
        LabelEncoding,
        OneHotEncoding,
        ScaleAbsoluteMax,
        ScaleMinMax,
        ScaleZScore,
        RemoveOutliersStandardDeviation,
        RemoveOutliersQuantiles,
        RemoveOutliersZScore,
        RemoveOutliersIQR,
        RemoveOutliersIsolationForest,
        RemoveOutliersOneClassSVM,
        RemoveOutliersByLocalFactor,
        // Data analysis
        ToggleColumnType,
        NumericalStatistics,
        CategoricalStatistics,
        AllStatistics,
        DrawScatterPlot,
        DrawBoxPlot,
        DrawViolinPlot,
        DrawBarPlot,
        DrawHistogram,
        DrawHexbin,
        DrawDensityPlot,
        DrawPiePlot,
        // Model
        SaveModel,
        LoadModel,
        LoadEpoch,
        MergeMIds,
        GetWeight,
        // Network
        ComputeMetrics,
        ChangeSettings,
        CreateNewNetwork,
        SelectTrainingData,
        Start,
        Stop,
        Continue,
        Dismiss,
        Predict
    }
}
