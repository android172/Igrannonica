
using dotNet.Models;

namespace dotNet.MLService {
    public class MLExperiment {
        private readonly MLConnection connection;

        public MLExperiment(IConfiguration configuration) {
            connection = new MLConnection(configuration);
        }

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
        ChangeSettings,
        Start,
        LoadData,
        LoadTestData,
        SelectInputs,
        SelectOutputs,
        RandomTrainTestSplit
    }
}
