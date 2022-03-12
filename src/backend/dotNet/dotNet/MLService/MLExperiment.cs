
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
            return;
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
    }

    public enum Command {
        ChangeSettings,
        Start
    }
}
