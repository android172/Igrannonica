
using dotNet.Models;

namespace dotNet.MLService {
    public class MLExperiment {
        private readonly MLConnection connection;
        private readonly object _lock = new();

        public MLExperiment(IConfiguration configuration, string token) {
            connection = new MLConnection(configuration);
            connection.Send(Command.SetToken);
            connection.Send(token);
        }

        // ///////////////// //
        // Data introduction //
        // ///////////////// //
        public bool IsDataLoaded(int experimentId) {
            lock (_lock) {
                connection.Send(Command.IsDataLoaded);
                connection.Send(experimentId);
                var loaded = connection.Receive();
                if (loaded != null && loaded.Equals("True"))
                    return true;
                return false;
            }
        }

        public void LoadDataset(int experimentId, string fileName) {
            lock (_lock) {
                connection.Send(Command.LoadData);
                connection.Send(experimentId);
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

        public void SaveDataset() {
            lock (_lock) {
                connection.Send(Command.SaveDataset);
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

        public void DeleteRow(int rowIndex) {
            lock (_lock) {
                connection.Send(Command.DeleteRow);
                connection.Send(rowIndex);
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

        public void DeleteColumn(int columnIndex) {
            lock (_lock) {
                connection.Send(Command.DeleteColumn);
                connection.Send(columnIndex);
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
        public void RemoveOutliersStandardDeviation(int[] columns, float treshold) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersStandardDeviation);
                connection.Send(EncodeIntArray(columns));
                connection.Send(treshold);
                CheckStatus();
            }
        }

        public void RemoveOutliersQuantiles(int[] columns, float treshold) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersQuantiles);
                connection.Send(EncodeIntArray(columns));
                connection.Send(treshold);
                CheckStatus();
            }
        }

        public void RemoveOutliersZScore(int[] columns, float treshold) {
            lock (_lock) {
                connection.Send(Command.RemoveOutliersZScore);
                connection.Send(EncodeIntArray(columns));
                connection.Send(treshold);
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

        // /////// //
        // Network //
        // /////// //

        // Saving and loading ANN models
        public void SaveModel(string modelName) {
            lock (_lock) {
                connection.Send(Command.SaveModel);
                connection.Send(modelName);
                CheckStatus();
            }
        }

        public void LoadModel(string modelName) {
            lock (_lock) {
                connection.Send(Command.LoadModel);
                connection.Send(modelName);
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

        // Working with ANN-s
        public string ComputeMetrics() {
            lock (_lock) {
                connection.Send(Command.ComputeMetrics);
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

        public void Start() {
            lock (_lock) {
                connection.Send(Command.Start);
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
        SetToken,
        // Data introduction
        IsDataLoaded,
        LoadData,
        LoadTestData,
        SaveDataset,
        SelectInputs,
        SelectOutputs,
        RandomTrainTestSplit,
        // Data access
        GetRows,
        GetRowCount,
        GetColumnTypes,
        // Data manipulation
        AddRow,
        AddRowToTest,
        UpdateRow,
        DeleteRow,
        AddColumn,
        UpdateColumn,
        RenameColumn,
        UpdateAndRenameColumn,
        DeleteColumn,
        UpdateValue,
        EmptyStringToNA,
        ZeroToNA,
        DropNAListwise,
        DropNAPairwise,
        DropNAColumns,
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
        NumericalStatistics,
        CategoricalStatistics,
        AllStatistics,
        // Network
        SaveModel,
        LoadModel,
        LoadEpoch,
        ComputeMetrics,
        ChangeSettings,
        Start
    }
}
