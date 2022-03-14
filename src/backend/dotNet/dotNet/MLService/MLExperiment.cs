
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
                testAccuracy: float.Parse(results[0])
            );
        }

        public void LoadDataset(string path) {
            connection.Send(Command.LoadData);
            connection.Send(path);
        }

        public void LoadInputs(string[] inputs) {
            connection.Send(Command.SelectInputs);
            connection.Send(inputs);
        }
    }

    public enum Command {
        ChangeSettings,
        Start,
        LoadData,
        SelectInputs,
        SelectOutputs,
        RandomTrainTestSplit
    }
}
