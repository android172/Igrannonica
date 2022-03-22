
using dotNet.Models;

namespace dotNet.MLService {
    public class MLExperiment {
        private readonly MLConnection connection;

        public MLExperiment(IConfiguration configuration) {
            connection = new MLConnection(configuration);
        }

        // ///////////////// //
        // Data introduction //
        // ///////////////// //

        public void LoadDataset(string path) {
            connection.Send(Command.LoadData);
            connection.Send(path);
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

        public void LabelEncoding(int[] columns) {
            connection.Send(Command.LabelEncoding);
            connection.Send(EncodeIntArray(columns));
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

        // /////// //
        // Network //
        // /////// //
        public void ApplySettings(ANNSettings annSettings) {
            connection.Send(Command.ChangeSettings);
            connection.Send(annSettings);
        }

        public ClassificationMetrics Start() {
            connection.Send(Command.Start);
            string resultString = connection.Receive();
            string[] results = resultString.Split(":");
            return new ClassificationMetrics(
                trainAccuracy: float.Parse(results[0]),
                testAccuracy: float.Parse(results[1])
            );
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
        // Data introduction
        LoadData,
        LoadTestData,
        SelectInputs,
        SelectOutputs,
        RandomTrainTestSplit,
        // Data access
        GetRows,
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
        // Network
        ChangeSettings,
        Start
    }
}
