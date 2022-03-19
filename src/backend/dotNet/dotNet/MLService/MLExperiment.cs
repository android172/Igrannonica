
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

        // ///////////////// //
        // Data manipulation //
        // ///////////////// //

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
    }

    public enum Command {
        // Data introduction
        LoadData,
        LoadTestData,
        SelectInputs,
        SelectOutputs,
        RandomTrainTestSplit,
        // Data manipulation
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
