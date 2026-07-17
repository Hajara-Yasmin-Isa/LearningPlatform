// Supabase/GoTrue auth errors come back in English with no localization
// support. This maps the common ones to Hausa; anything unrecognized falls
// back to the original message rather than risk hiding a real error.
const ERROR_TRANSLATIONS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Imel ko password ba daidai ba ne.'],
  [/user already registered/i, 'An riga an yi rajistar wannan adireshin imel.'],
  [/email not confirmed/i, 'Ba a tabbatar da imel ɗin ba tukuna. Duba akwatin saƙonninka domin tabbatarwa.'],
  [/password should be at least/i, 'Password dole ta zama tsayi aƙalla haruffa 6.'],
  [/should be different from the old password/i, 'Password dole ta bambanta da tsohuwar.'],
  [/unable to validate email address/i, 'Adireshin imel ba daidai ba ne.'],
  [/rate limit/i, 'An wuce iyakar buƙatu. Ka jira kaɗan kafin ka sake gwadawa.'],
  [/for security purposes/i, 'Saboda dalilan tsaro, ka jira kaɗan kafin ka sake gwadawa.'],
]

export function translateAuthError(message: string): string {
  for (const [pattern, translation] of ERROR_TRANSLATIONS) {
    if (pattern.test(message)) return translation
  }
  return message
}
