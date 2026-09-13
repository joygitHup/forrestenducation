class ScoreLevel:
    EXCELLENT = '优秀'
    GOOD = '良好'
    PASS = '合格'
    FAIL = '不合格'


def score_level(score):
    if score >= 85:
        return ScoreLevel.EXCELLENT
    if score >= 70:
        return ScoreLevel.GOOD
    if score >= 60:
        return ScoreLevel.PASS
    return ScoreLevel.FAIL
