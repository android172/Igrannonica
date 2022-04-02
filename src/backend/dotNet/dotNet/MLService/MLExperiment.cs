
using dotNet.Models;

namespace dotNet.MLService {
    public class MLExperiment {
        private readonly MLConnection connection;

        public MLExperiment(IConfiguration configuration, string token) {
            connection = new MLConnection(configuration);
            connection.Send(Command.SetToken);
            connection.Send(token);
        }

        // ///////////////// //
        // Data introduction //
        // ///////////////// //

        public void LoadDataset(int experimentId, string fileName) {
            connection.Send(Command.LoadData);
            connection.Send(experimentId);
            connection.Send(fileName);
        }

        public void LoadDatasetTest(string path) {
            connection.Send(Command.LoadTestData);
            connection.Send(path);
        }

        public void LoadInputs(int[] inputs) {
            connection.Send(Command.SelectInputs);
            connection.Send(EncodeIntArray(inputs));
        }

        public void LoadOutputs(int[] outputs) {
            connection.Send(Command.SelectOutputs);
            connection.Send(EncodeIntArray(outputs));
        }

        public void TrainTestSplit(float ratio) {
            connection.Send(Command.RandomTrainTestSplit);
            connection.Send(ratio);
        }

        // /////////// //
        // Data access //
        // /////////// //

        public string GetRows(int[] rowIndices) {
            connection.Send(Command.GetRows);
            connection.Send(EncodeIntArray(rowIndices));
            return connection.Receive();
        }

        public int GetRowCount() {
            connection.Send(Command.GetRowCount);
            return int.Parse(connection.Receive());
        }

        public string GetColumnTypes() {
            connection.Send(Command.GetColumnTypes);
            return connection.Receive();
        }

        // ///////////////// //
        // Data manipulation //
        // ///////////////// //

        // CRUD operations
        public void AddRow(string[] newRow) {
            connection.Send(Command.AddRow);
            connection.Send(EncodeStringArray(newRow));
        }

        public void AddRowToTest(string[] newRow) {
            connection.Send(Command.AddRowToTest);
            connection.Send(EncodeStringArray(newRow));
        }

        public void UpdateRow(int rowIndex, string[] rowValues) {
            connection.Send(Command.UpdateRow);
            connection.Send(rowIndex);
            connection.Send(EncodeStringArray(rowValues));
        }

        public void DeleteRow(int rowIndex) {
            connection.Send(Command.DeleteRow);
            connection.Send(rowIndex);
        }

        public void AddColumn(string columnName, string[] column) {
            connection.Send(Command.AddColumn);
            connection.Send(EncodeStringArray(column));
            connection.Send(columnName);
        }

        public void UpdateColumn(int columnIndex, string[] columnValues) {
            connection.Send(Command.UpdateColumn);
            connection.Send(columnIndex);
            connection.Send(EncodeStringArray(columnValues));
        }

        public void RenameColumns(int columnIndex, string columnName) {
            connection.Send(Command.RenameColumn);
            connection.Send(columnIndex);
            connection.Send(columnName);
        }

        public void ReplaceColumn(int columnIndex, string newColumnName, string[] newColumnValues) {
            connection.Send(Command.UpdateAndRenameColumn);
            connection.Send(columnIndex);
            connection.Send(EncodeStringArray(newColumnValues));
            connection.Send(newColumnName);
        }

        public void DeleteColumn(int columnIndex) { 
            connection.Send(Command.DeleteColumn);
            connection.Send(columnIndex);
        }

        public void UpdataValue(int row, int column, object value) {
            connection.Send(Command.UpdateValue);
            connection.Send(row);
            connection.Send(column);
            connection.Send(value);
        }

        // Replace with NA
        public void ReplaceEmptyWithNA(int[] columns) {
            connection.Send(Command.EmptyStringToNA);
            connection.Send(EncodeIntArray(columns));
        }

        public void ReplaceZeroWithNA(int[] columns) {
            connection.Send(Command.ZeroToNA);
            connection.Send(EncodeIntArray(columns));
        }

        // Drop NA values
        public void DropNAListwise() {
            connection.Send(Command.DropNAListwise);
        }

        public void DropNAPairwise() {
            connection.Send(Command.DropNAPairwise);
        }

        public void DropNAColumns() {
            connection.Send(Command.DropNAColumns);
        }

        // Fill NA values
        public void FillNAWithMean(int[] columns) {
            connection.Send(Command.FillNAWithMean);
            connection.Send(EncodeIntArray(columns));
        }

        public void FillNAWithMedian(int[] columns) {
            connection.Send(Command.FillNAWithMedian);
            connection.Send(EncodeIntArray(columns));
        }

        public void FillNAWithMode(int[] columns) {
            connection.Send(Command.FillNAWithMode);
            connection.Send(EncodeIntArray(columns));
        }
        public void FillNAWithRegression(int naColumn, int[] inputColumns) {
            connection.Send(Command.FillNAWithRegression);
            connection.Send(naColumn);
            connection.Send(EncodeIntArray(inputColumns));
        }

        // Encoding
        public void OneHotEncoding(int[] columns) {
            connection.Send(Command.OneHotEncoding);
            connection.Send(EncodeIntArray(columns));
        }

        public void LabelEncoding(int[] columns)
        {
            connection.Send(Command.LabelEncoding);
            connection.Send(EncodeIntArray(columns));
        }

        // Normalization
        public void ScaleAbsoluteMax(int[] columns) { 
            connection.Send(Command.ScaleAbsoluteMax);
            connection.Send(EncodeIntArray(columns));
        }

        public void ScaleMinMax(int[] columns) {
            connection.Send(Command.ScaleMinMax);
            connection.Send(EncodeIntArray(columns));
        }

        public void ScaleZScore(int[] columns) { 
            connection.Send(Command.ScaleZScore);
            connection.Send(EncodeIntArray(columns));
        }

        // Outliers
        public void RemoveOutliersStandardDeviation(int[] columns, float treshold) {
            connection.Send(Command.RemoveOutliersStandardDeviation);
            connection.Send(EncodeIntArray(columns));
            connection.Send(treshold);
        }

        public void RemoveOutliersQuantiles(int[] columns, float treshold) {
            connection.Send(Command.RemoveOutliersQuantiles);
            connection.Send(EncodeIntArray(columns));
            connection.Send(treshold);
        }

        public void RemoveOutliersZScore(int[] columns, float treshold) {
            connection.Send(Command.RemoveOutliersZScore);
            connection.Send(EncodeIntArray(columns));
            connection.Send(treshold);
        }

        public void RemoveOutliersIQR(int[] columns) {
            connection.Send(Command.RemoveOutliersIQR);
            connection.Send(EncodeIntArray(columns));
        }

        public void RemoveOutliersIsolationForest(int[] columns) {
            connection.Send(Command.RemoveOutliersIsolationForest);
            connection.Send(EncodeIntArray(columns));
        }

        public void RemoveOutliersOneClassSVM(int[] columns)
        {
            connection.Send(Command.RemoveOutliersOneClassSVM);
            connection.Send(EncodeIntArray(columns));
        }

        public void RemoveOutliersByLocalFactor(int[] columns)
        {
            connection.Send(Command.RemoveOutliersByLocalFactor);
            connection.Send(EncodeIntArray(columns));
        }

        // ///////////// //
        // Data analysis //
        // ///////////// //

        // Get column statistics
        public string NumericalStatistics(int[] columns) {
            connection.Send(Command.NumericalStatistics);
            connection.Send(EncodeIntArray(columns));
            return connection.Receive();
        }

        public string CategoricalStatistics(int[] columns) {
            connection.Send(Command.CategoricalStatistics);
            connection.Send(EncodeIntArray(columns));
            return connection.Receive();
        }

        public string ColumnStatistics() {
            connection.Send(Command.AllStatistics);
            return connection.Receive();
        }

        // /////// //
        // Network //
        // /////// //

        public string ComputeMetrics() {
            connection.Send(Command.ComputeMetrics);
            return connection.Receive();
        }

        public void ApplySettings(ANNSettings annSettings) {
            connection.Send(Command.ChangeSettings);
            connection.Send(annSettings);
        }

        public void Start() {
            connection.Send(Command.Start);
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
    }

    public enum Command {
        SetToken,
        // Data introduction
        LoadData,
        LoadTestData,
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
        ComputeMetrics,
        ChangeSettings,
        Start
    }
}
