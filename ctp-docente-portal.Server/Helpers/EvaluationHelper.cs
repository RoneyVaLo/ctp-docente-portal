namespace ctp_docente_portal.Server.Helpers
{
    public static class EvaluationHelper
    {
        public static decimal CalculateWeightedAverage(IEnumerable<(decimal score, decimal weight)> scores)
        {
            if (!scores.Any()) return 0;

            decimal totalWeight = scores.Sum(s => s.weight);
            if (totalWeight == 0) return 0;

            decimal weightedSum = scores.Sum(s => s.score * s.weight);
            return weightedSum / totalWeight;
        }
    }
}
