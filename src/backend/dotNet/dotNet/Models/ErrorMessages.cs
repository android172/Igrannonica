using Microsoft.AspNetCore.Mvc;

namespace dotNet.Models
{
    public class ErrorMessages
    {
        public const string ExperimentNotLoaded  = "ERROR :: Experiment not loaded.";
        public const string ColumnsNotSelected   = "ERROR :: Columns not selected.";
        public const string ExperimentNameExists = "ERROR :: Experiment with this name already exists.";
        public const string FileNotFound         = "ERROR :: File not found.";
        public const string Unauthorized         = "ERROR :: Access unauthorized.";
        public const string FileNotGiven         = "ERROR :: File not given.";
        public const string FileWrongFormat      = "ERROR :: Wrong file format.";
        public const string ModelExists          = "ERROR :: Model with this name already exists.";
        public const string ModelNotFound        = "ERROR :: Model not found.";
        public const string NoTrainingData       = "ERROR :: Wrong training data given";

        public const string RowNotSelected = "ERROR :: Row not selected.";
        public const string RowNotFilled   = "ERROR :: Row data not filled.";
        public const string FieldNotFilled = "ERROR :: Field not filled.";

        public const string NoExperiments    = "ERROR :: There are no experiments.";
        public const string CantDeleteModel  = "ERROR :: Model deletion failed.";
        public const string SettingsNotFound = "ERROR :: Model settings not found.";

        public const string DatasetVersionExists = "ERROR :: Dataset version with this name already exists.";

        public const string RatioNotGiven = "ERROR :: Ratio not given.";

    }
}
