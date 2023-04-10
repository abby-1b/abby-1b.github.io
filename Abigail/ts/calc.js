"use strict";
const stageChances = [
    1 - 0.91,
    1 - 0.59,
    1 - 0.51,
    1 - 0.01, // Appeal (council)
];
const conditions = [
    "Multiple sclerosis",
    "Cancer",
    "Heart problems",
    "Respiratory conditions",
    "Asthma",
    "Arthritis / joint problems",
    "Anxiety / related conditions",
    "Back injuries / back issues",
];
const conditionPercentages = [
    0.80,
    0.64,
    0.72,
    0.47,
    0.44,
    0.40,
    0.37,
    0.34
];
// const stageConditionChances: (number | undefined) = [
//  [
//  ]
// ]
/*

The equation takes into account the stage of approval that you've reached.

Once you've gone through the first stage of approval, the chances of getting accepted get lower with each stage that you're not approved.

To calculate this, we have to make the assumption that you won't give up after getting denied, and will keep going, continuing to appeal to the next step.

(Abigail: keep in mind that the underscore '_' sign here is used for 'sub' notation, so a_n means a-sub-n, or a at the index n. You can do sub notation using Ctrl + , in Google Docs.)

To actually calculate the final percentages, we first take the chances of getting approved at each step:

a = [
    38%,
    15%,
    51%,
    1%
]

And the probability that we don't get picked at each step (1 - a):

b = [
    62%,
    85%,
    49%,
    99%
]

Then, to calculate the final percentages, all we have to do is take the chance that we get accepted for this stage (a_n) and add the chances that we have assuming failure, repeating for each step.

So for the first stage, we have:
a_0 + b_0 * a_1 + b_1 * a_2 + b_2 * a_3

Which is:
0.38 + 0.64 * 0.15 + 0.85 * 0.51 + 0.49 * 0.01 = 0.9144 = 91%

Then, we just need to repeat this for every step, stopping at the last step for our calculation.

a_1 + b_1 * a_2 + b_2 * a_3
0.15 + 0.85 * 0.51 + 0.49 * 0.01 = 0.5884 = 59%

a_2 + b_2 * a_3
0.51 + 0.49 * 0.01 = 0.5149 = 51%

a_3
0.01 = 1%


The website itself just asks questions to get what stage of the process you're at, so it can do these calculations based off of the original percentages we acquired, finally giving you an estimate of how likely you are to get picked if you are persistent.



If a subject has no pre-existing conditions, their denial rate is 100%.

Otherwise, all of the denial rates for the subject's marked conditions are added together and then divided by the number of marked conditions, resulting in an averyage of denial rates.

This can be subtracted from 100% to get the acceptance rate.




To calculate the chances of getting accepted by a subject's conditions, you start off with 100% (which is the chance that you'll get denied if you have no conditions).

Then, for every condition present, we multiply that value by the condition's denial rate at the chosen stage.

For example, the denial rate for respiratory disorders in the first consideration stage is 47%. We would then multiply our initial 100% (1.00) by 47% (0.47), giving us 47% (0.47).

If the subject also has cancer, we multiply this 47% (0.47) by the cancer denial rate in this stage: 64% (0.64), giving us 30% (0.3008).

We can keep doing this for each condition present, and the final number is the denial rate for the subject with all of these conditions.

*/ 