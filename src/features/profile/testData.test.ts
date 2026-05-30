// this is where we test our pretend-profile data!!!
// first we import the test profile data we created
import test from "node:test";
import { testPublicProfiles, testUserProfiles, testProfileSettings, searchProfileByUsername } from "./testData.js";
// and then we also import the general profile interfaces we created
import type { PublicProfile, UserProfile, ProfileSettings } from "./types";

const publicProfilesEqual: PublicProfile[] = testPublicProfiles;
const userProfilesEqual: UserProfile[] = testUserProfiles;
const settingsEqual: ProfileSettings = testProfileSettings;

// test search for goober1
const gooberOneSearch = searchProfileByUsername("goober1");
if (!gooberOneSearch) {
    throw new Error("Search for profile with username goober1 failed :(");
}

// test search for nonexistent user, should return undefined
const noOneSearch = searchProfileByUsername("whoisthis");
if (noOneSearch != undefined) {
    throw new Error("Nonexistent user; search expected to be undefined.")
}

// theme testing
if (testProfileSettings.theme != "light" && testProfileSettings.theme != "dark") {
    throw new Error("Theme is not one of the allowed options!")
}

console.log("All profile data tests passed! :D");
 