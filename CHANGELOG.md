# MiniReelinator

* *[v1.39.0.rc1]*
  * [DESIGN]: Updated the navigation on sign up and sign up confirmation
    to match new site
  * [DESIGN]: Updated hint placement on landing page sign up form
  * [FIX]: When there are no campaigns in the list due to filtering or
    searching, show "No matching campaigns" instead of "Let's get you started"

## v1.38.0 (March 8, 2016)
* *[v1.38.0.rc2]*
  * [FIX]: Date range dropdown aligned correctly in grid
  * [FEATURE]: key and x/y axis labels added to quartiles chart in stats
  * [FIX]: hint.css updated to v2.0.0 - 2016-01-25
  * [FIX]: Fix hover tooltip on quartile bar graph
  * [FIX]: Add "%" units to y-axis on quartile bar graph
  * [FIX]: When authentication is required to access a url ensure that
    the user is redirected to that page once logged in
* *[/v1.38.0.rc2]*

* *[v1.38.0.rc1]*
  * [DEV]: Added grunt task for inspecting and validating HTML
  * [FIX]: Fix for an issue where "Cancel Changes" button does not
    take user back to manage campaign view
  * [DESIGN]: Fix for an issue where column headers and footers looked
    broken at small window size
  * [FEATURE]: Require admins to enter a duration before approving a
    a campaign in the unlikely event that the backend is unable to
    determine the duration
  * [FEATURE]: Add quartile data and "view calculator" to Stats page
  * [FEATURE]: Update engagement data display with graphs
  * [FIX]: Ensure that a lack of duration or views does not break the
    quartile graph and view calculator on the stats page
* *[/v1.38.0.rc1]*

## v1.37.0 (February 29, 2016)
* *[v1.37.0.rc3]*
  * [FIX]: Fix duplicate input IDs on new campaign page
  * [FIX]: Fix for an issue where datepicker's minimum date wasn't
    being properly respected
  * [DEV]: Fix faulty date-based unit test
* *[/v1.37.0.rc3]*

* *[v1.37.0.rc2]*
  * [DESIGN]: Added styles for sign up form for landing pages
  * [FIX]: Fix the link to sign up on login page
* *[/v1.37.0.rc2]*

* *[v1.37.0.rc1]*
  * [FEATURE]: Add "Awaiting Approval" campaign list view
  * [FEATURE]: Display lifetime date range on stats page
  * [FIX]: When copying a campaign only copy the payment method if the
    user is the campaign creator
  * [FIX]: Fix for an issue where the user's advertisers were fetched
    more often than necessary
  * [FEATURE]: Update error messages when uploading files or from URL
  * [FEATURE]: Add dynamic pricing information in UI for when targeting
    categories have variable costs
  * [FIX]: Don't show lifetime date range on stats page if start date is
    in the future
  * [FEATURE]: Show error message below "submit" button when required
    fields are empty
  * [FIX]: Only show password error when user leaves the field
  * [FEATURE]: Add url route that displays only the sign up form without
    the surrounding branding and images
* *[/v1.37.0.rc1]*

## v1.36.1 (February 17, 2016)
* *[v1.36.1.rc1]*
  * [FIX]: Fixed the zip code input style issue on payment modal
* *[/v1.36.1.rc1]*

## v1.36.0 (February 16, 2016)
* *[v1.36.0.rc5]*
  * [DEV]: Add backup Intercom module in case their library fails to load
* *[/v1.36.0.rc5]*

* *[v1.36.0.rc4]*
  * [FIX]: Fix for an issue where a website url is not properly scraped
    when user leaves the website input field
  * [DESIGN]: Fix image path to graphic on sign up page
* *[/v1.36.0.rc4]*

* *[v1.36.0.rc3]*
  * [DESIGN]: Fix for an issue with org filter styles
  * [FIX]: Apply filter selections when dropdown closes instead of after
    every selection
  * [FIX]: Validate zip code when user clicks away from zip input field
  * [FIX]: Update radius when user clicks away from radius input field
* *[/v1.36.0.rc3]*

* *[v1.36.0.rc2]*
  * [DEV]: Fix for an issue where Intercom's variable path was breaking
    the the r.js optimization build step
* *[/v1.36.0.rc2]*

* *[v1.36.0.rc1]*
  * [DESIGN]: Added styles to allow filtering campaigns by organizations
  * [FEATURE]: Add Org filter in campaign list view for users who can see
    campaigns from other Orgs
  * [FEATURE]: Save Org filter settings when user filters Orgs
  * [DESIGN]: Added styles for zip radius targeting
  * [FEATURE]: Add Intercom user tracking events for tracking campaign creation,
    updates and submission
  * [DESIGN]: Updated layout for sign up and sign up success pages
  * [FEATURE]: Add zip code targeting
  * [FIX]: Fix for an issue where the login prompt was hidden by the
    loading spinner
  * [FIX]: Fix for an issue where user's were unable to delete their
    primary payment method
* *[v1.36.0.rc1]*

## v1.35.1 (February 8, 2016)
* *[v1.35.1.rc1]*
  * Remove adtech fields and some other confusing entries from the update request summary table
  * [FIX]: Show errors when failing to approve or reject a campaign in the admin tab
  * Change cinema6.com urls to reelcontent.com. This includes new home pages for
    the Platform and Studio, updated API base urls and library paths
  * Change all "Cinema6" references in UI to "Reelcontent"
  * Temporarily treat both "completed" and "outOfBudget" campaign statuses as
    "Out of Budget"
  * Remove "Error" filter from campaign list UI but always query for campaigns
    with errors
* *[/v1.35.1.rc1]*

## v1.35.0 (February 4, 2016)
* *[v1.35.0.rc2]*
  * [FIX]: Fix for an issue where the payment optional entitlement was being
    read from the campaign creator instead of the logged in Selfie user
* *[/v1.35.0.rc2]*

* *[v1.35.0.rc1]*
  * [FEATURE]: Show a spinner when loading the campaign list, creating new
    campaigns and opening existing draft campaigns
  * [FEATURE]: Add "soft alerts" that appear in the top right of campaign
    creation screen showing when campaign is autosaving, when it has saved
    and if there is an error saving
  * [FEATURE]: Add spinners to buttons that trigger actions that may take
    a few seconds to complete: copy, cancel, delete campaign, submit campaign,
    add credit card and save credit card
  * [FEATURE]: Add Vimeo Social Sharing link field in Campaign Creation screen
  * [FEATURE]: When Admin opens non-draft campaign with no pending update
    direct them to Manage Campaign tab and show them Campaign and Card ID
  * [FIX]: Fix for an issue where opening/editing another user's campaign
    broke the view
  * [FEATURE]: Add support for "completed" campaign status and display it as
    "Out of Budget" in the UI
* *[/v1.35.0.rc1]*

## v1.34.2 (February 2, 2016)
* *[v1.34.2.rc1]*
  * [FIX]: Fix remaining budget calculation in campaign list view
* *[/v1.34.2.rc1]*

## v1.34.1 (February 2, 2016)
* *[v1.34.1.rc1]*
  * [FIX]: Show remaining budget as a percentage in campaign list view
  * [FIX]: Fixed create campaign TOC Link positioning issue for small window size
* *[/v1.34.1.rc1]*

## v1.34.0 (February 1, 2016)
* *[v1.34.0.rc3]*
  * [DESIGN]: Corrected the order of budget and spend, updated interaction
    rate label on campaign list
* *[/v1.34.0.rc3]*

* *[v1.34.0.rc2]*
  * [FIX]: Fix for an issue where clicking on the preview link failed
    to open the preview page
* *[/v1.34.0.rc2]*

* *[v1.34.0.rc1]*
  * [FEATURE]: Add start/end date, interaction rate, stats for "today" to
    the campaign list (REEL-49)
  * [FEATURE]: Add creative preview link (REEL-45)
  * [FEATURE]: Saved last used filter, sort and search in Campaign
    List view (REEL-94)
  * [FIX]: Show error if daily limit is set and is less than total
    budget divided over flight dates
* *[/v1.34.0.rc1]*

## v1.33.1 (January 26, 2016)
* *[v1.33.1.rc1]*
  * [FIX]: Require payment for campaign creation (REEL-99)
* *[/v1.33.1.rc1]*

## v1.33.0 (January 22, 2016)
* *[v1.33.0.rc2]*
  * [FIX]: Fixed dropdown menu bug on manage payment options page
* *[/v1.33.0.rc2]*

* *[v1.33.0.rc1]*
  * [DESIGN]: Added Support document link to nav, security seals to credit card
    popup and updated footer to show build on hover
  * [FEATURE]: Add date ranges to Stats tab in Manager view
  * [FIX]: Always show Stats tab in Manager view
  * [FIX]: Do not show any interaction stats when there are no recorded views
  * [FIX]: Properly display empty stats when views are 0
* *[/v1.33.0.rc1]*

## v1.32.1 (January 15, 2016)
* *[v1.32.1.rc1]*
  * [FIX]: Reverted white background change, updated campaign summary
  * [DEV]: Fix the referral code property that is saved on user sign-up
* *[/v1.32.1.rc1]*

## v1.32.0 (January 14, 2016)
* *[v1.32.0.rc3]*
  * [FEATURE]: Add support for referrals
  * [FIX]: Fix for an issue where imported website logos weren't being saved
  * [FIX]: Fix for an issue where password restrictions weren't being enforced
  * [FIX]: Fix for an issue where sliding input labels didn't work properly
    when email or password inputs were invalid
* *[/v1.32.0.rc3]*

* *[v1.32.0.rc2]*
  * [FIX]: Fix estimated views calculation in campaign summary
* *[/v1.32.0.rc2]*

* *[v1.32.0.rc1]*
  * [DESIGN]: Added styles for campaign summary on manage campaign screen
  * [FEATURE]: Add campaign summary to Manage Campaign screen (REEL-67)
  * [FEATURE]: Add preset Call To Action options (REEL-31)
  * [FIX]: Fix for an issue where updating user information prevented them
    from returning to the dashboard
  * [DESIGN]: Changed website background, text and form input color
  * [FIX]: Show data from pending update requests in Dashboard
  * [FIX]: Update rejection text for non-draft campaigns
* *[/v1.32.0.rc1]*

## v1.31.0 (January 8, 2016)
* *[v1.31.0.rc3]*
  * [FIX]: Fix for an issue where an error would not appear for some invalid video links
  * [FIX]: Fix for an issue where some Kaltura videos would autoplay in the video preview
  * [FIX]: Ensure that user is prompted to login if file upload returns 401
* *[/v1.31.0.rc3]*

* *[v1.31.0.rc2]*
  * [FIX]: Only show Selfie-supported social links when scraping website
* *[/v1.31.0.rc2]*

* *[v1.31.0.rc1]*
  * [FIX]: Remove 'Approved' filter from the campaigns list view dropdown
  * [DESIGN]: Added html/css for multi date stats dropdown
  * [DESIGN]: Updated form fields border styles
  * [DESIGN]: Updated background for the create/edit campaign screen
  * [DESIGN]: Added custom radio buttons
  * [DESIGN]: Updated the preview size on manage campaigns
  * [DESIGN]: Added styles for URL scraping
  * [FIX]: Fixed the logo resolution issue for retina display
  * [DESIGN]: Updated player splash screen images to use Reelcontent branding
  * [FEATURE]: Add support for Kaltura videos
  * [FEATURE]: Add ability to scrape links and logo from website url
* *[v1.31.0.rc1]*

## v1.30.1 (December 18, 2015)
* *[v1.30.1.rc3]*
  * [DESIGN]: Moved flight dates underneath the budget section
  * Remove all references to customers in the Studio and Selfie
* *[/v1.30.1.rc3]*

* *[v1.30.1.rc2]*
  * [FIX]: Hide New Campaign button if user has no advertisers
* *[/v1.30.1.rc2]*

* *[v1.30.1.rc1]*
  * Handle users with no advertiser and customer ids
  * When editing a campaign load the creator's advertiser and logos based on org
* *[/v1.30.1.rc1]*

## v1.30.0 (December 17, 2015)
* *[v1.30.0.rc2]*
  * [FIX]: Fix for an issue where Selfie campaigns were incorrectly saving customer id
* *[/v1.30.0.rc2]*

* *[v1.30.0.rc1]*
  * [FEATURE]: Add support for Brightcove videos
  * Prepare Campaign Manager and Selfie for the removal of Customer entity
* *[/v1.30.0.rc1]*

## v1.29.1 (December 16, 2015)
* *[v1.29.1.rc1]*
  * [FIX]: Fix for an issue that would cause a Wistia url to incorrectly display
    when editing a campaign
  * [FIX]: Fix the formatting of budget, daily limit and total spend numbers in
    the campaign dashboard
  * [REFACTOR]: Update the studio/selfie preview to use the player
    service
* *[/v1.29.1.rc1]*

## v1.29.0 (December 15, 2015)
* *[v1.29.0.rc3]*
  * [DESIGN]: Fixed stats page font style issue
  * [FIX]: Stop polling for 202 results after 30 seconds
  * [FIX]: Remove old, unsupported interests from campaigns
  * [FIX]: Stop trimming spaces from the end of video headline, description and
    call to action button text
  * [FIX]: Stop setting Selfie campaigns to skip after 30 seconds
  * [DESIGN]: Remove the pie chart on Stats tab
* *[/v1.29.0.rc3]*

* *[v1.29.0.rc2]*
  * [DESIGN]: Fixed stats page formatting issue
  * [DESIGN]: Corrected input type in css for safari border issue for targeting
  * [FIX]: Exclude call-to-action and website clicks from social click totals
* *[/v1.29.0.rc2]*

* *[v1.29.0.rc1]*
  * Show human readable interest labels in the campaign admin tab
  * [FEATURE]: Add Campaign Stats tab in manager area
  * [FEATURE]: Enforce limits on headline, description and call to action text
  * [DESIGN]: Updated styles to show/hide character limit text, fixed safari input issue
  * [DEV]: Fix requirejs build task so that chartjs lib doesn't get bundled
* *[v1.29.0.rc1]*

## v1.28.1 (December 9, 2015)
* *[v1.28.1.rc4]*
  * [DESIGN]: Fixed button alignment for flight dates and updated label
* *[v1.28.1.rc4]*

* *[v1.28.1.rc3]*
  * [DESIGN]: Fixed datepicker bottom padding issue, updated summary and submit button label
  * [FEATURE]: Add timeline option for "run continuously" vs. setting flight dates
* *[/v1.28.1.rc3]*

* *[v1.28.1.rc2]*
  * [FIX]: Update CPV calculations
* *[/v1.28.1.rc2]*

* *[v1.28.1.rc1]*
  * Show warning in the admin tab if there is no payment method
  * [FEATURE]: Show start and end dates in the admin tab
  * [FEATURE]: Add support for Instagram video-only cards
  * [DESIGN]: Added styles for campaign confirmation modal
  * [FEATURE]: Add Flight Dates in campaign creator/editor view
  * [DESIGN]: Added styles for campaign stats screen
  * [FEATURE]: Add Campaign Summary modal when submitting
  * [FIX]: Update CPV calculations
  * [FIX]: Show warning when choosing flight dates within the next two days
  * [DESIGN]: Added styles for icons on stats page, updated font-awesome library
  * [DESIGN]: Added styles for datepickers to fix IE bug and to higlight selected dates
  * [DESIGN]: Added missing styles for stats hover/help text
* *[/v1.28.1.rc1]*

## v1.28.0 (December 1, 2015)
* *[v1.28.0.rc1]*
  * [DESIGN]: Updated styles for titles on create/manage campaign, settings and interests
  * [DESIGN]: Added styles for datepickers and character limit counter
  * [DEPRECATION]: Remove the lightbox with playlist player
  * [DEPRECATION]: Remove support for ballots where the results are
    shown to the user
  * [DEPRECATION]: Remove support for text-only cards
  * [DEPRECATION]: Remove support for website (article) cards
  * [DEPRECATION]: Remove support for videos from rumble.com
  * [DEPRECATION]: Remove support for videos from AOL On
  * [DEPRECATION]: Remove support for videos from Yahoo! Screen
  * [FIX]: Do not require payment method for submitting campaign
* *[/v1.28.0.rc1]*

## v1.27.0 (November 24, 2015)
* *[v1.27.0.rc1]*
  * [DESIGN]: Added styles for soft alerts and spinners
  * [DESIGN]: Adding a fix height for interest selection
  * [FEATURE]: Add Canceled and Expired campaigns to dashboard
  * [FEATURE]: Add ability to Check/Uncheck All statuses in the dropdown
  * [DESIGN]: Add styles for Check/Uncheck All button in the dropdown
  * [DESIGN]: Changed search button color and added targeting sub headline
  * [FIX]: When editing/managing a campaign always load the campaign creator's payment methods
  * [FEATURE]: Add Google Analytics tracking for Selfie
  * [DESIGN]: Updated the icons for interest expand/collapse and changed alert message for
    when users try to leave edit screen without submitting changes
  * [FIX]: In campaign editor view only allow adding new payment methods when viewer is
    the creator of the campaign
  * [FIX]: When a top tier interest has no child interests then clicking the name
    selects/deselects the tier
  * [FIX]: Fix for an issue where deleting user details in one view effected details
    in another view
* *[/v1.27.0.rc1]*

## v1.26.0 (November 23, 2015)
* *[v1.26.0.rc7]*
  * [DESIGN]: Fix for an issue where interest tiers with a long list of child interests
    looked broken when scrolling
  * [FIX]: Added Vidyard to the list of supported video players
* *[/v1.26.0.rc7]*

* *[v1.26.0.rc6]*
  * [FIX]: Fix for an issue where interest tiers with no child interests
    were selected by by default
* *[/v1.26.0.rc6]*

* *[v1.26.0.rc5]*
  * [DESIGN]: Added styles for interest selector on create campaign
* *[/v1.26.0.rc5]*

* *[v1.26.0.rc4]*
  * [DESIGN]: Fixed signup success message layout, added styles and branding for video preview
  * [FEATURE]: Add expanable/collapsible interest targeting multi-selector
  * [FIX]: Fix for an issue that made it impossible to access the
    Portal/Platform login page after being redirected to the
    Platform/Portal, respectively.
  * [FIX]: Hide the Interest section if no Interests are found
* *[/v1.26.0.rc4]*

* *[v1.26.0.rc3]*
  * [FIX]: Fix for an issue where the preview for some JWPlayer videos would not load
  * [FIX]: Fix for an issue where JWPlayer previews would not reload when given a different JWPlayer link
  * [FEATURE]: Added support for Vidyard
  * [FEATURE]: Added support for recognizing Wistia and Vzaar embed codes
* *[/v1.26.0.rc3]*

* *[v1.26.0.rc2]*
  * [FIX]: (Selfie) Fix for an issue where the "Lose changes?" alert was triggered after successfully
    submitting changes to an active campaign
* *[/v1.26.0.rc2]*

* *[v1.26.0.rc1]*
  * [FEATURE]: (Selfie) Enable editing of campaigns with pending update requests
  * [FEATURE]: (Selfie) Allow deletion of pending campaigns
  * [FEATURE]: (Selfie) Alert users to unsaved changed to active campaigns before exiting editor view
  * [FEATURE]: (Selfie) Ask for confirmation before submitting changes to active campaigns
  * [FEATURE]: (Selfie) Enable sorting by modified date and sponsor name in Campaign Dashboard
  * [FIX]: (Selfie) Fix for an issue where Call to Action url could be saved without a protocol
  * [FIX]: (Selfie) Update Selfie page title to be "Reelcontent" and Portal to be "Studio"
  * [FIX]: (Selfie) Fix for an issue where default card data properties were not being saved
  * [FIX]: (Selfie) Remove all thumbnail functionality
  * [DESIGN]: Added styles for button spinners, replaced C6 references with Reelcontent
* *[/v1.26.0.rc1]*

## v1.25.0 (November 17, 2015)
* *[v1.25.0.rc7]*
  * [FIX]: Fix for an issue where the process for approving campaign update requests would fail to
    recognize deleted entities
  * [DESIGN]: Added styles for login popup (shown when session expires)
  * [DESIGN]: (Selfie) Fixed the issue with circle nav hint hiding behind the form elements,
    added styles to hide circle hint after the page scrolls to relevent section
* *[/v1.25.0.rc7]*

* *[v1.25.0.rc6]*
  * [FIX]: Fix for an issue that caused the static card map manager to
    not work
* *[/v1.25.0.rc6]*

* *[v1.25.0.rc5]*
  * [FIX]: Restore voting functionality for sponsored cards
* *[/v1.25.0.rc5]*

* *[v1.25.0.rc4]*
  * [FIX]: Fix for an issue that caused changes to cards not to be
    persisted
  * [FIX]: Fix for an issue that caused splash image configuration not
    to be persisted
  * [FIX]: Fix for an issue where JWPlayer previews would not fill the preview area
* *[/v1.25.0.rc4]*

* *[v1.25.0.rc3]*
  * [DESIGN]: (Selfie) Change "Daily Budget" to "Daily Limit"
  * [DESIGN]: (Selfie) Change heading and sub-heading for Targeting section
  * [FEATURE]: (Selfie) Show error states on all required fields when attempting to submit
  * [FIX]: (Selfie) Fix for an issue where logging in after session expiration broke things
  * [DESIGN]: (Selfie) Updated "Activate your account" text on account confirmation and resend
    activation link screens
  * [DESIGN]: (Selfie) Updated action buttons on create and manage campaign screens
  * [DESIGN]: (Selfie) Updated main navigation, added retina display logo, updated sign up
    page text, fixed pagination alignment, removed hover on sort by sponsor
  * [FEATURE]: (Selfie) Remove call to action dropdown, default to button, require button
    text and url, always show a call to action button in the preview, fix input color
  * [FIX]: (Selfie) Default the logo option to "Upload from URL"
* *[/v1.25.0.rc3]*

* *[v1.25.0.rc2]*
  * [FIX]: Fix for an issue where "Ad Start" pixels were saved incorrectly
  * [FEATURE]: (Selfie) Prompt user to login when session has expired, ensure that the
    they don't lose any changes they had made
  * [FIX]: (Selfie) Ensure that email fields have a type of "email" to trigger the correct
    keyboard on iPads and mobile devices
  * [FIX]: (Selfie) Fix for an issue where the labels of select dropdowns were not clickable
  * [FIX]: (Selfie) Only auto save drafts when the viewer/editor is the original creator
  * [FEATURE]: (Selfie) Require Website link for campaign creation
  * [DESIGN]: (Selfie) Reorder the links in the UI
  * [DESIGN]: (Selfie) Move the estimated views count below the Daily Limit field
  * [FIX]: (Selfie) Enable decimal dollar amounts for budget and limit
  * [FIX]: (Selfie) Fix for an issue where the payment method primary dropdown was hidden
  * [DESIGN]: (Selfie) Added styles and message for empty dashboard and error states on
    section navigation on create/edit campaign
  * Add support for deploying selfie to \*.reelcontent.com
  * **Extra Deployment Steps**:
    * Deploy [`c6embed` v3.0.3](https://github.com/cinema6/c6embed/milestones/v3.0.3)
* *[v1.25.0.rc2]*

* *[v1.25.0.rc1]*
  * [FEATURE]: Added support for JWPlayer
  * [FEATURE]: (Selfie) Support other video player types (Vzaar, Wistia, etc)
  * [FIX]: (Selfie) Update Budget and Daily Limit error messages to be more informative
  * [FIX]: (Selfie) Updated branding (changed logo, primary buttons, links, accent colors
    etc), removed help text from inputs based on feedback, updated side navigation for
    sections on create campaign.
  * [FIX]: (Selfie) Updated form field labels for create campaign, changed preview player
  * [FIX]: (Selfie) Stop logging user in automatically after successful account confirmation
  * [FIX]: (Selfie) Enable text searching in select dropdowns
  * [FIX]: (Selfie) Highlight error message on failed Sign Up attempt
  * [FIX]: (Selfie) Fix error highlighting on email field in Sign Up page
  * [FIX]: (Selfie) Ensure input labels move to the side when fields are autofilled
  * [FIX]: (Selfie) Remove "None" option from gender targeting dropdown
  * [FIX]: (Selfie) Redirect users with no campaigns to the New Campaign page after login
* *[/v1.25.0.rc1]*

## v1.24.0 (November 5, 2015)
* *[v1.24.0.rc2]*
  * [FEATURE]: (Selfie) Show user name and company of campaign creator in dashboard
    but only if current user is an admin
  * [FIX]: (Selfie) Fix for an issue where autosaves were triggered as soon aa a new
    campaign was opened
  * [DESIGN]: (Selfie) Make delete and cancel buttons red on hover
* *[/v1.24.0.rc2]*

* *[v1.24.0.rc1]*
  * [FEATURE]: (Selfie) Created admin tab to moderate update requests
  * [DESIGN]: (Selfie) Moved campaign action buttons out of the tab
  * [DESIGN]: (Selfie) Added description for sections on create campaign
  * [DESIGN]: (Selfie) Added styles for alert modal
  * [DEV]: (Selfie) Campaign and card are now one entity
  * [FIX]: (Selfie) Fix for an issue where autosaving could overwrite current UI changes
  * [FIX]: (Selfie) Stop making a request to upload a og from a URL if no URL is defined
  * [FIX]: (Selfie) Remove "Targeting" and "Budget" tabs from Manage Campaign screen
  * [FEATURE]: (Selfie) Add ability to copy and edit active campaigns
  * [FIX]: (Selfie) Remove content categorization in Campaign Creation
  * [FEATURE]: (Selfie) Show campaign stats (views + spend) in the dashboard
  * [FEATURE]: (Selfie) Autosave draft campaigns when leaving the page
  * [DESIGN]: (Selfie) Updated styles for Create and Manage campaign, added sidebar
    navigation item for "waiting approval"
  * [FIX]: (Selfie) Fixed styles for Manage Campaign tabs
  * [FIX]: (Selfie) Add http:// protocol to links if user doesn't supply them
  * [FEATURE]: (Selfie) Default the call to action to the Website link if available
  * [FEATURE]: (Selfie) Add Social Sharing link in Campaign Creation screen
  * [FEATURE]: (Selfie) Add ability to manage campaigns (pause, resume, cancel)
  * Update embed code generator to create Player Service embed codes
  * Update preview page URLs for new preview page API
  * [DESIGN]: (Selfie) Added styles to improve Admin tab, Campaign list (pending/rejected
    messages), updated help text and sub text
  * [FIX]: (Selfie) Ensure campaign cards are saved in correct format for the player
  * [FIX]: (Selfie) Fix for an issue where changes to targeting weren't being saved
  * [FEATURE]: (Selfie) Calculate CPV based on user's settings
  * [FIX]: (Selfie) Fix for an issue where delayed autosaves were happening after
    submission for approval
  * [FIX]: (Selfie) Ensure non-Admin users cannot access the admin tab for a campaign
  * [FIX]: (Selfie) Only allow selecting of one gender for targeting
  * [FIX]: (Selfie) Ask for confirmation before deleting a draft campaign
  * [FIX]: (Selfie) Save the campaign and remove preview if user removes video url
  * [DEV]: Set status to "active" when creating new campaigns in the Campaign Manager
  * **Extra Deployment Steps**:
    * Deploy [`c6embed` v3.0.0](https://github.com/cinema6/c6embed/milestones/v3.0.0)
    * Update MiniReelinator experience
* *[/v1.24.0.rc1]*

## v1.23.0 (October 27, 2015)
* *[v1.23.0.rc3]*
  * [DESIGN]: (Selfie) Added styles for credit card popup
  * [FIX]: (Selfie) Abbreviate credit card types (ie. AMEX, DISC)
  * [FIX]: (Selfie) Close payment option dropdown after making selection or when
    clicking anywhere outside the dropdown
  * [FIX]: (Selfie) Add blue border to Credit Card inputs when in focus
  * [FIX]: (Selfie) Ask for confirmation before deleting a payment method or
    making it primary
* *[/v1.23.0.rc3]*

* *[v1.23.0.rc2]*
  * [FEATURE]: (Selfie) Add Payment Method manager in Account Settings
  * [FEATURE]: (Selfie) Add Payment History page in Account Settings
  * [FEATURE]: (Selfie) Add Payment options in Campaign creation and management areas
  * [DESIGN]: (Selfie) Added styles for Payment options screens
* *[/v1.23.0.rc2]*

* *[v1.23.0.rc1]*
  * [DESIGN]: (Selfie) Added styles for Payment Management and Payment History screens
  * [DESIGN]: (Selfie) Added styles notification alerts and added main navigation labels
  * [FIX]: (Selfie) Do not show video input error when there is no video source
  * [DEV]: (Selfie) Do not save empty cards array on new campaigns
  * [FIX]: (Selfie) Ensure that campaign budget and daily limit are saved as Numbers
  * [FIX]: (Selfie) Save categories (ie. Interests and Content Categories) by ID
    instead of by name
* *[/v1.23.0.rc1]*

## v1.22.0 (October 15, 2015)
* *[v1.22.0.rc7]*
  * [FIX]: Make Advertiser API calls to /advrs instead of /advertisers
* *[/v1.22.0.rc7]*

* *[v1.22.0.rc6]*
  * [FIX]: Fix for an issue where new campaigns weren't created correctly
* *[/v1.22.0.rc6]*

* *[v1.22.0.rc5]*
  * [FIX]: (Selfie) Fix for an issue that caused account confirmation to
    fail catastrophically
  * [FIX]: On login and auth check ensure that a user is decorated with their Org
    if they have one
  * [FIX]: Fix link to Login page on the sign up success page
* *[/v1.22.0.rc5]*

* *[v1.22.0.rc4]*
  * [DEV]: (Selfie) Ensure newly confirmed user is added to c6 DB
* *[/v1.22.0.rc4]*

* *[v1.22.0.rc3]*
  * [FIX]: (Selfie) Fix for an issue where a failure to confirm a new user is not properly
    communicated to the user.
  * [FEATURE]: (Selfie) When a new user is confirmed redirect them to the Selfie Dashboard
* *[/v1.22.0.rc3]*

* *[v1.22.0.rc2]*
  * [FIX]: (Selfie) Fix for an issue where the user ID was not found on the confirmation page
  * [FIX]: (Selfie) Fix for an issue where an attempt was made to find a 'new' user's Org
    even though they don't have one yet.
  * [FIX]: (Selfie) Fix for an where campaign data was not being properly normalized/defaulted
  * [FIX]: (Selfie) Optimize the Logo Service so it makes fewer calls for less data
  * [FIX]: Fix for an issue where the Campaign Manager was inaccessible even when user's had
    permission to see it.
* *[/v1.22.0.rc2]*

* *[v1.22.0.rc1]*
  * [FEATURE]: (Selfie) User sign up, confirmation link, resend activation link,
    login, forgot password, reset password
  * [FIX]: (Selfie) Fix for an issue where the link to the "go to login screen"
    on the Sign Up page wasn't working
  * [DEV]: (Selfie) Move the main navigation container div to the outermost template
  * [DESIGN]: (Selfie) Updated styles for sign up, login, forgot password, reset password,
    resend link and account settings. Added side navigation.
  * [FEATURE]: (Selfie) Add search functionality to Campaign Dashboard
  * [FEATURE]: (Selfie) Add multi-status filtering in Campaign Dashboard
  * [FIX]: (Selfie) Updated side navigation to use anchor tag instead of nested anchors
    inside divs, corrected input,select and labels to use matching "id"s and "for"s
  * [FIX]: (Selfie) Add validation on Sign Up form
  * [FEATURE]: (Selfie) Add Sign Up Success page
  * [FIX]: (Selfie) Ensure that the correct target app is sent when requesting a password reset
  * [FIX]: (Selfie) Show appropriate reason/message when redirected to Login page
  * [FEATURE]: (Selfie) Add Content Categorization for campaign creation
  * [FIX]: (Selfie) When creating a campaign use default the sponsor name to be the user's company name
  * [FEATURE]: (Selfie) Add targeting for Demographics, DMAs and Interests
  * [FEATURE]: (Selfie) Add Account Settings pages
  * [DESIGN]: (Selfie) Added html/css for inline budget edit on campaign list
  * [DESIGN]: (Selfie) Hiding charts from campaign list as they won't be a part of Beta release
  * [DEV]: (Selfie) Add Campaign Service for normalizing campaign data
  * [DEV]: (Selfie) Query campaigns by 'statuses' in the Campaign Dashboard
* *[/v1.22.0.rc1]*

## v1.21.0 (September 30, 2015)
* *[v1.21.0.rc1]*
  * [FEATURE]: Added the ability to create Wistia video cards
  * [FEATURE]: Add validation for Campaign budget, daily limit and cost
  * Hide Sponsorship Manager
  * [FEATURE]: (Selfie) Add filtering, sorting and pagination in Campaign Dashboard
* *[/v1.21.0.rc1]*

## v1.20.0 (September 17, 2015)
* *[v1.20.0.rc2]*
  * [FIX]: Fix for an issue preventing the thumbnails for some Vzaar videos to be generated incorrectly
* *[/v1.20.0.rc2]*

* *[v1.20.0.rc1]*
  * [FEATURE]: Added the ability to create Vzaar video cards
* *[/v1.20.0.rc1]*

## v1.19.0 (September 16, 2015)
* *[v1.19.0.rc4]*
  * [FIX]: Fix for an issue where changes to a campaign's pricing model were not
    enabling the "Save" button
* *[/v1.19.0.rc4]*

* *[v1.19.0.rc3]*
  * [FEATURE]: Add social sharing for video sponsored cards
  * [FEATURE]: (Selfie) Add tabbed management screen for non-draft campaigns
  * [DEV]: (Selfie) Modularize campaign editing tools: categories, geo-targeting, budget, preview
  * [FIX]: Fix for an issue where refreshing the page when creating a new campaign
    caused an error and blocked the loading of the app
  * [FIX]: Fix for an issue where a deleted sponsored card placeholder that was targeted
    in a campaign placement cause the Campaign Placements tab to be unusable
  * [FEATURE]: Expose campaign pricing settings in the Campaign Manager
* *[/v1.19.0.rc3]*

* *[v1.19.0.rc2]*
  * [FIX]: Fix for an issue which prevented specifying a custom Instagram thumbnail URL
* *[/v1.19.0.rc2]*

* *[v1.19.0.rc1]*
  * [FEATURE]: Added the ability to create Instagram sponsored cards
  * [FIX]: Fix for an issue that prevented Instagram cards without captions from being saved
  * [FIX]: Change how Instagram cards are saved to be more consistent with
    the format in which other cards are saved.
  * [FEATURE]: Activated Instagram card creation in the wizard
  * [FIX]: (Selfie) Only allow one category per campaign
  * [FIX]: (Selfie) Allow multiple U.S. States for geo targeting campaigns
  * [FIX]: (Selfie) Only fetch logos for Selfie campaigns (no Studio campaigns)
  * [FIX]: (Selfie) Ensure the Video Title input label is positioned correctly
    even when the title get magically filled in based on a new video source
  * [FIX]: (Selfie) Add very loose validation for link URLs
  * [FIX]: (Selfie) Disable Submit button if required properties aren't set
* *[/v1.19.0.rc1]*

## v1.18.1 (August 21, 2015)
* *[v1.18.1.rc1]*
  * [DEV]: Make karma debug server show colors
  * [FIX]: Stop lots of errors from being thrown in the console when
    editing/creating a sponsored video card
  * [DEV]: Make grunt server run over http by default, https if
    `--secure` is passed on the command line
  * [FIX]: Fix for an issue that caused duplicate card entires to be
    added to a campaign after editing and saving an exisitng sponsored
    card
* *[/v1.18.1.rc1]*

## v1.18.0 (August 19, 2015)
* *[v1.18.0.rc1]*
  * [FIX]: Fix for an issue where the new cards are inserted at the wrong index
  * [FIX]: Fix for an issue where advertiser and customer data were saved
    to User accounts
  * [FEATURE]: (Selfie) Add Campaign Dashboard
  * [FIX]: Only show Selfie Campaigns in Selfie App and Studio Campaigns in
    Studio App
* *[/v1.18.0.rc1]*

## v1.17.0 (August 12, 2015)
* *[v1.17.0.rc3]*
  * [FEATURE]: Added the ability to add a title when creating Instagram cards
  * [FIX]: Fix for an issue where the where wrong card type was created in
    the MiniReel Editor
* *[/v1.17.0.rc3]*

* *[v1.17.0.rc2]*
  * [FIX]: Fix for an issue preventing the splash image for MiniReels containing
    Instagram cards from being generated correctly
  * [FIX]: (Selfie) Add advertiser and customer IDs to campaigns
* *[/v1.17.0.rc2]*

* *[v1.17.0.rc1]*
  * [FEATURE]: Added support for creating Instagram cards
  * [FEATURE]: (Selfie) Add Campaign Creation UI
* *[/v1.17.0.rc1]*

## v1.16.2 (August 12, 2015)
* *[v1.16.2.rc1]*
  * [FIX]: Fix for an issue that caused the pagination controls in the
    campaign manager not to work
  * [FIX]: Fix for an issue that caused requests for all
    MiniReels/Campaigns to be made when opening a single
    MiniReel/Campaign
  * [FIX]: Fix for an issue that caused multiple campaign delete
    requests to be sent to the server if the user clicked "delete" again
    while the first deletion was happening
* *[/v1.16.2.rc1]*

## v1.16.1 (August 7, 2015)
* *[v1.16.1.rc2]*
  * [FIX]: Configure the VPAID player to use the most current c6ui swf
* *[/v1.16.0.rc2]*

* *[v1.16.1.rc1]*
  * Update c6ui to v3.7.3
* *[/v1.16.0.rc1]*

## v1.16.0 (July 31, 2015)
* *[v1.16.0.rc2]*
  * Update c6embed to v2.35.4
* *[/v1.16.0.rc2]*

* *[v1.16.0.rc1]*
  * [FEATURE]: Added support for creating Vine video cards
  * Make it possible to only delete Sponsored MiniReels from the
    campaign manager
  * [FIX]: Fix for an issue that caused the campaign manager to take
    longer to load than it should
* *[/v1.16.0.rc1]*

## v1.15.0 (July 23, 2015)
* *[v1.15.0.rc2]*
  * [FIX]: Fix for an issue that caused multiple MiniReels to be created
    when clicking "Save" multiple times quickly
* *[/v1.15.0.rc2]*

* *[v1.15.0.rc1]*
  * [FEATURE]: When creating an image card, you can use the url of any image
  * Update c6ui to v3.7.2
* *[/v1.15.0.rc1]*

## v1.14.1 (July 20, 2015)
* *[v1.14.1.rc1]*
  * Add a source property to image cards when they are saved.
  * Update collateral service for uploading files and saving from URIs
  * Remove Recap card from Studio UI
  * Ensure that MiniReels with less than two cards have no recap card, while
    MiniReels with more than one card have recap cards
* *[/v1.14.1.rc1]*

## v1.14.0 (July 8, 2015)
* *[v1.14.0.rc4]*
  * [FIX]: Fix for an issue causing a GettyImages image preview not to be displayed
* *[/v1.14.0.rc4]*

* *[v1.14.0.rc3]*
  * [FIX]: Fix for an issue causing a card note to be displayed incorrectly.
* *[/v1.14.0.rc3]*

* *[v1.14.0.rc2]*
  * [FEATURE]: Activated image card creation in the wizard
  * [FIX]: Fix for an error preventing the preview of a webpage card
* *[/v1.14.0.rc2]*

* *[v1.14.0.rc1]*
  * [FEATURE]: Enabled the creation of GettyImages and Flickr image cards.
  * [FEATURE]: Added webpage card creation to the Campaign manager.
* *[/v1.14.0.rc1]*

## v1.13.1 (July 1, 2015)
* *[v1.13.1.rc1]*
  * [FIX]: Fix for an issue that prevented text cards from being created.
* *[/v1.13.1.rc1]*

## v1.13.0 (June 24, 2015)
* *[v1.13.0.rc1]*
  * [FEATURE]: Add Selfie Application
  * Allow static placements to be removed implicitly by removing all
    wildcard entries
  * [FIX]: Fix for an issue that allowed duplicate links to be added to
    a campaign/card/etc. but not saved to the server
  * [FIX]: Fix for an issue that caused custom video thumbnails to not
    be removable
  * [FIX]: Fix for an issue that made a campaign's placement
    configuration for a MiniReel appear to disappear after
    adding/removing a sponsored card placeholder to/from that MiniReel
  * [FIX]: Fix for an issue that caused the Editor to prompt the user to
    click "Publish Changes" instead of "Done" when they are finished
    editing
  * [FIX]: Fix for an issue that caused VPAID ads not to playback during
    preview
  * [FIX]: Fix for an issue that caused the Campaign manager not to load
    if a MiniReel used by a campaign for placement was deleted
* *[/v1.13.0.rc1]*

## v1.12.1 (June 15, 2015)
* *[v1.12.1.rc1]*
  * [FIX]: Fix for an issue that caused a MiniReel's User to be removed
    if the User cannot be found
  * [FIX]: Fix for an issue that kept the Editor's card table paginator
    from correctly expanding/contracting when adding/removing cards
  * [FEATURE]: Handle 202 responses from the API
* *[/v1.12.1.rc1]*

## v1.12.0 (May 13, 2015)
* *[v1.12.0.rc1]*
  * Use c6embed to drive the studio preview
  * [FIX]: Fix for an issue that caused broken preroll ads to appear in
    the preview modal
  * Create all new MiniReels as MiniReel Player 2.0 MiniReels
* *[/v1.12.0.rc1]*

## v1.11.4 (May 8, 2015)
* *[v1.11.4.rc2]*
  * [FIX]: Ensure Ad Count and Ad Start pixels are saved correctly
* *[/v1.11.4.rc2]*

* *[v1.11.4.rc1]*
  * [FIX]: Fixed CSS rendering issue where modal title bar would appear during preview mode.
  * [FEATURE]: Add Click Url and Ad Count Url support to Sponsored Card Manager
* *[/v1.11.4.rc1]*

## v1.11.3 (May 1, 2015)
* *[v1.11.3.rc2]*
  * [FIX]: Urls are valid if the start with "http://", "https://"" or "//""
* *[/v1.11.3.rc2]*

* *[v1.11.3.rc1]*
  * [FIX]: Allow more complex image urls
* *[/v1.11.3.rc1]*

## v1.11.2 (April 27, 2015)
* *[v1.11.2.rc1]*
  * [FEATURE]: Allow editing of a Sponsored MiniReel's branding
* *[/v1.11.2.rc1]*

## v1.11.1 (April 24, 2015)
* *[v1.11.1.rc1]*
  * [FIX]: Fix for an issue where sponsored cards with the same title
    where not showing as options in the Campaign placements manager
* *[/v1.11.1.rc1]*

## v1.11.0 (April 9, 2015)
* *[v1.11.0.rc3]*
  * Display error state on invalid image url inputs
  * Enable scrolling within modal views
* *[/v1.11.0.rc3]*

* *[v1.11.0.rc2]*
  * [FIX]: Show Sponsored MiniReels in Placements tab of Campaign Manager
  * [FEATURE]: Enable campaign parameter in Editor embed codes
* *[/v1.11.0.rc2]*

* *[v1.11.0.rc1]*
  * [FEATURE]: Add setting for "Ad" text on thumbnail of sponsored card
  * Enable Placeholder Video Type in Sponsored Minireels
  * [FEATURE]: Enable embed codes for "Preview Purposes Only"
  * [FIX]: Ensure Editor mini-map is centered for MiniReels with no vide cards
  * Validate image urls in the Sponsorship and Campaign Managers
* *[/v1.11.0.rc1]*

## v1.10.0 (March 27, 2015)
* *[v1.10.0.rc3]*
  * Replaced "Settings" with icon on Sponsored MR screen in Camp Mgr.
* *[/v1.10.0.rc3]*

* *[v1.10.0.rc2]*
  * Enable controls on YouTube and DailyMotion video in search panel
  * [FIX]: Fix cancel button on error dialog in Campaign Manager
  * [FEATURE]: Add Brand setting to Campaigns, Sponsored Cards and
    Sponsored MiniReels
  * Display the Campaign's Brand in the Campaign Manager
* *[/v1.10.0.rc2]*

* *[v1.10.0.rc1]*
  * Made necessary changes for MiniReel Player 2.0 to work properly
  * Add MOAT checkbox to Wildcard Video settings editor
* *[/v1.10.0.rc1]*

## v1.9.1 (March 24, 2015)
* *[v1.9.1.rc1]*
  * [FEATURE]: Allow for a custom advertiser name for a Campaign
* *[/v1.9.1.rc1]*

## v1.9.0 (March 19, 2015)
* *[v1.9.0.rc11]*
  * Hide placeholder video type in Sponsored MiniReel editor
  * Change Placement and Sponsored MiniReel preview buttons to be simple links
  * Update c6ui to v3.7.1
  * [FEATURE]: Disable Next Step, Confirm and Save buttons when end dates
    are set in the past
  * [FEATURE]: Add error dialogs to alert failures in saving campaigns
* *[/v1.9.0.rc11]*

* *[v1.9.0.rc10]*
  * Change where the reporting ID for a sponsored card is stored
  * Temporarily hide the Dynamic Groups tab in the Campaign Manager
  * [FIX]: Fix for an issue where canceling a static card Placement caused
    the minireel to be added anyway
  * [FIX]: Only show campaigns belonging to the logged in User's Org
  * [FEATURE]: Add preview and embed code buttons next to Placements
  * [FEATURE]: Add preview and embed code buttons next to Sponsored MiniReels
  * Filter out Customers and Advertisers that should not be used for Campaigns
  * Convert local dates/times to UTC in Campaign Manager
* *[/v1.9.0.rc10]*

* *[v1.9.0.rc9]*
  * [FIX]: Fix for an issue that caused a new Sponsored Card/MiniReel
    not to copy the links from a campaign until the campaign was saved
  * [FEATURE]: Add support for setting an end date on a sponored
    Card/MiniReel
  * [FEATURE]: Add support for setting a name on a sponored Card/MiniReel
  * [FEATURE]: Add support for showing a sponsored MiniReel/Card's state
    in the campaign manager
* *[/v1.9.0.rc9]*

* *[v1.9.0.rc8]*
  * Split Creatives tab into separate Sponsored Cards and Sponsored
    MiniReels tabs
* *[/v1.9.0.rc8]*

* *[v1.9.0.rc7]*
  * [FIX]: Fix for an issue that caused a campaign not to be marked as
    saved when on the placements tab if all of a placement's slots were
    not filled
  * Re-enable ability to create and manage sponsored MiniReels in a
    campaign
* *[/v1.9.0.rc7]*

* *[v1.9.0.rc6]*
  * [FIX]: Fix for an issue that could cause a campaign to enter a
    broken state after its MiniReel groups have been saved to the
    server
* *[/v1.9.0.rc6]*

* *[v1.9.0.rc5]*
  * More updates to campaign manager ui
  * Added reporting ID for sponsored card videos, to be used in reports
* *[/v1.9.0.rc5]*

* *[v1.9.0.rc4]*
  * Sort categories alphabetically
  * Remove ability to create/view/edit a campaign's sponsored MiniReels
  * Changed some language in the campaign manager in an attempt to
    improve clarity
* *[/v1.9.0.rc4]*

* *[v1.9.0.rc3]*
  * [FIX]: Fix for an issue that caused cards to not be creatable
  * [FIX]: Fix for an issue that made sponsored MiniReels unpublishable
  * [FIX]: Fix for an issue that made campaigns unsaveable after
    creating a sponsored minireel
* *[/v1.9.0.rc3]*

* *[v1.9.0.rc2]*
  * [FIX]: Fix for an issue that caused campaigns to not be saveable
  * [FIX]: Styles added for campaign manager
* *[/v1.9.0.rc2]*

* *[v1.9.0.rc1]*
  * [FEATURE]: Added Campaign manager (for managing wildcard campaigns.)
* *[/v1.9.0.rc1]*

## v1.8.1 (January 26, 2014)
* *[v1.8.1.rc2]*
  * [FIX]: Fix for an issue that caused all new cards to be placed in the
    first position
  * [FIX]: Fix for an issue that caused creating a new card to actually
    start editing the last new card to be created
* *[/v1.8.1.rc2]*

* *[v1.8.1.rc1]*
  * [FIX]: Fix for an issue that could break adding new cards to a
    MiniReel from the studio
* *[/v1.8.1.rc1]*

## v1.8.0 (January 23, 2014)
* *[v1.8.0.rc2]*
  * [FIX]: Fix for an issue that caused unit tests not to pass when
    running on Jenkins
* *[/v1.8.0.rc2]*

* *[v1.8.0.rc1]*
  * Logic to find "minireelinator" experience more robust
  * [FEATURE]: studio editor nav updated with left/right buttons and pageMap styles
* *[/v1.8.0.rc1]*

## v1.7.0 (December 22, 2014)
* *[v1.7.0.rc1]*
  * [FEATURE]: Added ability to make sponsored cards completely
    unskippable
  * [FEATURE]: Added media queries to collapse nav for smaller screens.
  * [FEATURE]: Added ability to enable/disable player controls for a
    video
* *[v1.7.0.rc1]*

## v1.6.0 (December 8, 2014)
* *[v1.6.0.rc1]*
  * Changed tab order for new card wizard
  * [FEATURE]: Added ability to render embed code for MiniReel.tv
    (iframe embed code)
  * [FEATURE]: Added ability to add Rumble.com videos to MiniReels
* *[/v1.6.0.rc1]*

## v1.5.3 (December 4, 2014)
* *[v1.5.3.rc1]*
  * When a MR is copied, the cards in that MR will be given new IDs
  * [FEATURE]: The app build version is now shown in the footer
* *[/v1.5.3.rc1]*

## v1.5.2 (December 4, 2014)
* *[v1.5.2.rc1]*
  * [FIX]: Copied MRs will now have their own elections in the vote
    database
* *[/v1.5.2.rc1]*

## v1.5.1 (November 21, 2014)
* *[v1.5.1.rc1]*
  * [FIX]: Fix for an issue that would cause AOL On Videos not to load
    in the preview page
* *[/v1.5.1.rc1]*

## v1.5.0 (November 20, 2014)
* *[v1.5.0.rc3]*
  * [FIX]: Fix for an issue where AOL On video durations would appear as
    "NaN:NaN" in the search results
* *[/v1.5.0.rc3]*

* *[v1.5.0.rc2]*
  * Added error message when trying to preview AOL videos (because they
    cannot be previewed over HTTPS
* *[/v1.5.0.rc2]*

* *[v1.5.0.rc1]*
  * [FEATURE]: Added support for adding surveys to sponsored cards
  * [FEATURE]: Added support for creating Yahoo! Screen and AOL On cards
* *[/v1.5.0.rc1]*

## v1.4.1 (November 12, 2014)
* *[v1.4.1.rc1]*
  * [FIX]: Fix for an issue that caused SSL warnings when trying to
    access preview links
* *[/v1.4.1.rc1]*

## v1.4.0 (November 7, 2014)
* *[v1.4.0.rc2]*
  * [FIX]: Ensure that incomplete adConfig settings are handled
  in AdManager
  * [FIX]: Fix verbiage on Display Ad Settings tab in AdManager
* *[/v1.4.0.rc2]*

* *[v1.4.0.rc1]*
  * Add checkbox in Display Ad Settings to enable/disable display ads
    on eligible cards
  * Enable the post-video (watch-again) module in the single-video
    player
  * Removed display ad settings from the single-video placement screen
    (this will be managed from the Ad Settings Manager now.)
* *[/v1.4.0.rc1]*

## v1.3.0 (October 28, 2014)
* *[v1.3.0.rc3]*
  * [FEATURE]: Allow custom skip times to be entered for sponsored cards
* *[/v1.3.0.rc3]*

* *[v1.3.0.rc2]*
  * [FIX]: Make it possible to edit some addition fields necessary for
    sponsored cards
  * [FIX]: Make sure the "Ad" label appears on sponsored cards, and the
    video source ("via YouTube", etc.) does not
* *[/v1.3.0.rc2]*

* *[v1.3.0.rc1]*
  * [FIX]: Fix for an issue that caused requests for minireels to take
    longer than necessary
* *[/v1.3.0.rc1]*

## v1.2.1 (October 16, 2014)
* *[v1.2.1.rc1]*
  * [FIX]: Preview Mode in the Studio Editor properly handles MiniReels
  that are set to use the Org's default ad settings
* *[/v1.2.1.rc1]*

## v1.2.0 (October 8, 2014)
* *[v1.2.0.rc1]*
  * [PERFORMANCE]: Remove some unnecessary code that was mildly slowing
    the amount of time it takes to open a MiniReel
  * [FIX]: Fix for an issue that could cause users with unusual, but
    valid email address not to change their email to that address
* *[/v1.2.0.rc1]*

## v1.1.0 (September 25, 2014)
* *[v1.1.0.rc1]*
  * [FIX]: Fix for an issue that could cause pagination to break in
    the Ad Manager
  * Made the required changes so that the new dynamic branding
    feature will work
* *[/v1.1.0.rc1]*

## v1.0.0 (September 23, 2014)
* *[v1.0.0.rc4]*
  * [FIX]: The card-editing modal now places itself on top of the
    video search panel whenever it is opened, or whenever a card
    is added from the video search
* *[/v1.0.0.rc4]*

* *[v1.0.0.rc3]*
  * [FIX]: Unchecking all sites in the search settings menu will
    yield zero results
  * [FIX]: The search results list is scrolled to the top with
    every new search/page
* *[/v1.0.0.rc3]*

* *[v1.0.0.rc2]*
  * [FEATURE]: Added "Apply" button to video search options
  * [FEATURE]: Updated slide editor text to hint at video search
  * [FEATURE]: added --focus styles to swap z-index hierarchy between
    video search panel and slide modals
  * [FEATURE]: added styles for video search results while dragging
* *[/v1.0.0.rc2]*

* *[v1.0.0.rc1]*
  * [FEATURE]: Added a integrated video search panel for
    finding videos and adding them to a MiniReel
* *[/v1.0.0.rc1]*

## Beta20.2 (September 18, 2014)
* *[Beta20.2.rc1]*
  * [FIX]: Mobile Preview: Fixed an issue where the places where ad
    cards could appear were empty pages
* *[/Beta20.2.rc1]*

## Beta20.1 (September 18, 2014)
* *[Beta20.1.rc1]*
  * [FIX]: Fixed an issue where editing the settings of an existing MiniReel
    rendered a broken view
* *[/Beta20.1.rc1]*

## Beta20 (September 15, 2014)
* *[Beta20.rc3]*
  * [FIX]: Added tooltips where missing; fixed instances of wrong tooltips.
* *[/Beta20.rc3]*

* *[Beta20.rc2]*
  * [FIX]: Fix for an issue that caused the tabs of the modals not to
    work
* *[/Beta20.rc2]*

* *[Beta20.rc1]*
  * [FEATURE]: You can now open MiniReels for editing in a new tab from
    the Studio manager
  * [FIX]: Fix for an issue that caused a white screen to display if you
    refresh the page when editing a new card
  * [FIX]: Updated dropdown box heights so that items are cut off to hint scrollable behavior. Thanks safari!
  * [FIX]: Editor button order changed to avoid rounded corner stacking
  * [FEATURE]: Added slide title to the slide editor
  * [FIX]: Fixed an issue that caused cmd-clicking a link not to open
    the link in a new tab as expected
* *[/Beta20.rc1]*

## Beta19 (September 11, 2014)
* *[Beta19.rc6]*
  * [FIX]: missing img for recap card fixed
  * [FIX]: reset password screen fixed
* *[/Beta19.rc6]*

* *[Beta19.rc5]*
  * [FIX]: Fix for an issue that would cause custom ad configs to be
    deleted after changing the editorial content of a MiniReel
* *[/Beta19.rc5]*

* *[Beta19.rc4]*
  * [FIX]: Don't add custom ad config to a MiniReel with default settings
  if no settings were changed
* *[/Beta19.rc4]*

* *[Beta19.rc3]*
  * [FIX]: Getting embed code from Ad Manager no longer takes user to Studio
  * [FIX]: Modal Editor styles fixed to clip long text titles.
  * [FEATURE]: Ad Manager can now be fully/partially disabled based on
    the user's permissions
  * [FIX]: Publish MiniReel button made more prominent
  * [FIX]: "Publish Modal" button label changed to "Publish Mode"
  * [FIX]: Fix for an issue where no value would be shown for the ad
    frequency option if the default ad frequency was less than the
    number of cards in the MiniReel
* *[/Beta19.rc3]*

* *[Beta19.rc2]*
  * [FIX]: Replaced instances of "Minireels" in the text with
    "MiniReels"
* *[/Beta19.rc2]*

* *[Beta19.rc1]*
  * [FEATURE]: The MiniReel Studio now has a brand new design
  * [FEATURE]: Users can now customize the advertising logic of thier
    MiniReels
  * All new MiniReels are now previewable with a public preview URL by
    default
  * [FIX]: Fix for an issue where re-publishing a MiniReel would cause
    its election data not to be updated
* *[/Beta19.rc1]*

## Beta18 (August 25, 2014)
* *[Beta18.rc1]*
  * [FIX]: MiniReel Preview page title no longer says "Cinema6
    Dashboard".
  * Browser title now changes as the user navigates to different "pages"
    of the app
  * [FIX]: Fix for an issue that could cause the video length trimmer to
    render incorrectly and not function
* *[/Beta18.rc1]*

## Beta17 (August 7, 2014)
* *[Beta17.rc4]
  * [FIX]: Fix for an issue that caused visual bugs on mobile devices
    when previewing a MiniReel
* *[/Beta17.rc4]

* *[Beta17.rc3]
  * [FEATURE]: Preview links - mobile view styles added
* *[/Beta17.rc3]

* *[Beta17.rc2]*
  * [FIX]: Fix for an issue that could cause a MiniReel not to load on
    the preview page in staging on FireFox
  * User-level settings are now stored in the same format as ProShop is
    saving them
* *[/Beta17.rc2]*

* *[Beta17.rc1]*
  * [FEATURE]: Added error messages for when a YouTube video cannot be
    found
  * [FEATURE]: Error messages for missing/unembeddable videos are now
    displayed in the list of cards (drag and drop interface)
  * [FEATURE]: Added a preview page for MiniReels
  * [FEATURE]: Added support for "Content Provider" users; These users
    will not have the ability to edit MiniReel properties that affect
    its presentation
  * More default MiniReel attributes (autoplay/type) can be specified in
    the user's organization
  * Default explicit embed size (non-responsive) can be specified in the
    user's organization
  * Embed code is no longer generated with the title and branding
    included (those are now fetched from the database)
* *[/Beta17.rc1]*

## Beta16 (August 1, 2014)
* *[Beta16.rc1]*
  * [FEATURE]: Added pages to reset the user's password if they forget
    it
  * [FEATURE]: Added error messages for when YouTube disables video embedding.
* *[/Beta16.rc1]*

## Beta15 (July 30, 2014)
* *[Beta15.rc3]*
  * [FIX]: Fix for an issue that caused user settings not to be changed
    when they were saved to the users database
* *[/Beta15.rc3]*

* *[Beta15.rc2]*
  * [FIX]: Fix for an issue that caused user settings not to be saved
    back to the users database
* *[/Beta15.rc2]*

* *[Beta15.rc1]*
  * [FIX]: If a MiniReel is published, editing image settings does not
    take effect until the "Publish" button is clicked
  * Splash image settings are now editable even when the MiniReel is
    published
  * MiniReel Editor now creates MiniReels that will use the dynamic ad
    configuration
  * The last splash theme/ratio the user selected is now stored in
    LocalStorage/the user DB
  * Generated Wordpress Shortcode has been updated to the latest format
    based on feedback from USAToday
* *[/Beta15.rc1]*

## Beta14 (July 25, 2014)
* *[Beta14.rc1]*
  * [FEATURE]: Create text cards by not specifying a video when
    creating/editing a card
  * [FIX]: The filter applied to the dashboard is remembered when you go
    back to the dashboard
  * Splash images now default to a 3:2 ratio with the title overlayed
  * The two tabs for choosing the MiniReel view mode have been
    consolidated into a single tab
* *[/Beta14.rc1]*

## Beta13 (July 22, 2014)
* *[Beta13.rc1]*
  * [FEATURE]: Support generating wordpress shortcode embeds
  * [FEATURE]: Styles for wordpress shortcode embeds added
  * [FEATURE]: Add support for new MR Player embed
* *[/Beta13.rc1]*

## Beta12 (July 17, 2014)
* *[Beta12.rc3]*
  * [FIX]: desktop preview modal height adjusted to prevent scrolling
* *[/Beta12.rc3]*

* *[Beta12.rc2]*
  * [FIX]: Filter experiences by org again
  * [FIX]: Change page title to "Cinema6 Portal"
  * [FIX]: desktop preview modal height adjusted to prevent scrolling
* *[/Beta12.rc2]*

* *[Beta12.rc1]*
  * [FIX]: Heavy text disabled, light text updated to allow inifinite text
  * [FIX]: Fixed CSS bugs from merging glickm into minireelinator
  * [FEATURE]: Splash image can now be downlaoded via the UI
  * [FEATURE]: MiniReelinator can now be run independently (outside of
    an iframe)
* *[/Beta12.rc1]*

## Beta11 (June 20, 2014)
* *[Beta11.rc1]*
  * [FIX]: Fixed an issue that could cause clicking "New Card" to edit
    the last card you created
* *[/Beta11.rc1]*

## Beta10 (June 19, 2014)
* *[Beta10.rc1]*
  * [FIX]: Close the preview modal when a lightbox card preview is closed
  * Ad card is no longer an option when inserting a card
  * Ad cards are no longer included in the Editor's deck
  * Ad cards are no longer auto-inserted into the Editor
  * Ad cards are now auto-inserted after the second video
  * Removes Ad settings tab from MiniReel-level modal
  * Removes Display Ad settings tab in Edit Card modal
  * [FIX]: splash image modal content positioning fixed
* *[/Beta10.rc1]*

## Beta9.2 (June 18, 2014)
* *[Beta9.2.rc1]*
  * [FIX]: Fix for an issue that caused the MR Preview to show the old
    splash screen
* *[/Beta9.2.rc1]*

## Beta9.1 (June 16, 2014)
* *[Beta9.1.rc1]*
  * [FIX]: Mobile preview modal min-height set
  * [FIX]: Fix for an issue that would cause a user not to be able to
    create a new MiniReel if the last MiniReel they made was created
    pre-custom splash templates
* *[/Beta9.1.rc1]*

## Beta9 (June 13, 2014)
* *[Beta9.rc4]*
  * [FIX]: New MiniReel button that appears when you have no MiniReels
    now links to the title tab of the New MiniReel modal rather than the
    Lightbox tab
  * Temporarily disable ability to edit splash image when the MiniReel
    is published
  * Temporarily disable the auto-generation of a splash image when the
    user clicks "Publish" on an already-published MiniReel
  * Recap cards are now given a title of "Recap of {{title}}"
* *[/Beta9.rc4]*

* *[Beta9.rc3]*
  * Temporarily remove "Preview This Slide" from underneath the ad cards
    until the player supports jumping right to them
* *[/Beta9.rc3]*

* *[Beta9.rc2]*
  * [FIX]: Fixed an issue that caused ad cards created by the MiniReel
    editor not to play
  * [FIX]: New cards are created with the ad server settings of the
    MiniReel
  * [FIX]: The MiniReel ad server settings are determined by the
    available waterfalls, not hardcoded to "cinema6"
* *[/Beta9.rc2]*

* *[Beta9.rc1]*
  * New elections are now created using arrays for storage
    * **The Vote Service that supports storing elections as arrays must
      be deployed**
  * [FEATURE]: Skinny modal tabs added for case where we need more space.
  * Embed code now includes Base64-encoded branding (used to pull down
    the custom stylesheet)
  * [FEATURE]: Ad cards are now an option when creating a new card
  * [FIX]: Ad card option modals properly styled
  * The custom splash stylesheet for each publisher is now included when
    in the editor
  * [FEATURE]: The splash ratio/theme of your last MiniReel is now
    used as the default when you create a new MiniReel
  * The embed code will now be configured for preloading on inline
    display modes
    * **v1.1.0 of c6embed must be deployed for this to work**
  * Alerts are now shown in the "Title" tab of the MiniReel Modal
  * In the MiniReel Modal, the user cannot click "Done" if there is no
    title inputed
  * [FEATURE]: Enable display and video ad control based on org privileges and minireel mode
* *[/Beta9.rc1]*

## Beta8 (June 9, 2014)
* *[Beta8.rc4]*
  * [FIX]: Unit (px/%) is now included in custom embed size
  * [FIX]: MiniReel is only saved from the MiniReel modal if it has not
    been saved yet
* *[/Beta8.rc4]*

* *[Beta8.rc3]*
  * [FIX]: When creating a new minireel, the minireel is not saved to
    the database until the user clicks "Done"
* *[/Beta8.rc3]*

* *[Beta8.rc2]*
  * [FIX]: Splash page preview next to the embed code will be refreshed
    when the image is updated
  * [FIX]: loading animation added to splash modal
* *[/Beta8.rc2]*

* *[Beta8.rc1]*
  * New MiniReels are no longer given a title of "Untitled"
  * [FIX]: Temporarily aligned modal dialogues to fixed height from top
  * Fixed MiniReel embed code modal styling when viewed from manager
  * Added splash preview click blocker so that splash preview next to embed code does not trigger
  * Fixed preview modal positioning
  * Fixed content flow based modals for previews added
* *[/Beta8.rc1]*

## Beta7 (June 6, 2014)
* *[Beta7.rc3] (June 6, 2014)
  * Fixed election save when miniReel is re-published
  * Updated s3 upload to not upload index.html until after the other files have been uploaded
* *[/Beta7.rc3]*

* *[Beta7.rc2] (June 5, 2014)
  * Add some logging to the minireelinator initialize and update methods.
* *[/Beta7.rc2]*

* *[Beta7.rc1] (June 5, 2014)
  * [FIX]: Character count of 0 is shown before the user types anything
    (instead of an empty space)
  * Upload collateral assets by experience and name assets by the key
    they are  stored on the collateral object with (i.e. "splash")
  * [FIX]: Minireelinator creating empty elections
  * [FIX]: Minireelinator not updating election data when re-publishing
  * [FIX]: Support handling updates on election with array based storage
* *[/Beta7.rc1]*

## Beta6 (May 27, 2014)
* *[Beta6.rc1]*
  * [FIX]: 'Create MiniReel' modals DOM update: 'General' tab added first, 'AutoPlay Settings' added to the end.
  * Ad server tab is only shown if the org is provisioned with their own
    ad server
  * Ad cards are now auto-added when creating a new MiniReel to meet the
    org's minAdCount
  * Ad cards will not be deleteable when the org's minAdCount is
    reached
* *[/Beta6.rc1]*

## Beta5 (May 20, 2014)
* *[Beta5.rc1]*
  * MiniReels are now sorted with the last modified MiniReel appearing
    first
* *[/Beta5.rc1]*

## Beta4 (May 16, 2014)
* *[Beta4.rc1]*
  * [FEATURE]: Added title prompt to New MR Creation Wizard
  * [FEATURE]: Added error states to cards
  * [FIX]: minireel type names updated to be more descriptive
* *[/Beta4.rc1]*

## Beta3 (May 15, 2014)
* *[Beta3.rc1]*
  * [FEATURE]: The save button in the edit card modal now changes text
    and behavior to guide the user through creating a card
  * [FIX]: In the card deck, plus buttons have been restored along with a new view for when they are next to the "New Slide" card.
  * [FEATURE]: New Card Modals now have warning text to let users know that certain fields are mandatory
  * [FIX]: In the card deck, fixed issue where drop zone heights were smaller than card heights
* *[/Beta3.rc1]*

## Beta2 (May 14, 2014)
* *[Beta2.rc1]*
  * [FIX]: Ad slide modals added
  * [FIX]: Ad option added to new card modal
  * [FEATURE]: The "New Card" card is now always displayed before the
    recap card
  * [FEATURE]: Ad Cards, Video Cards and Recap cards now have a unique
    view in the deck
  * [FEATURE]: A questionnaire can now be added at any time to any video
    card
* *[/Beta2.rc1]*

## Beta1 (April 29, 2014)
* Added a changelog
* Initial release of MRinator
* [FEATURE]: Show lightbox MiniReel preview in fullscreen
* [FIX]: Query for minireels with minireel type
* [FIX]: Don't throw errors if MiniReelService.close() is called after MiniReelService.save() in the same event loop
* [FIX]: Show newly-created MiniReels in development
* [FIX]: Use min-safe DI in animation
* [FIX]: Add kMode and kDevice query params to preview player
* [FIX]: Add trailing slash for passing query params to preview player
* [FIX]: Use preview player src to trigger refresh for mode/device changes
* *[Beta1.rc7]*
  * [FIX]: Remove "viewChangeStart" event handler when c6-view is destroyed, prevent memory leak
  * [FIX]: Copy autoplay settings when opening MiniReel
  * [FEATURE]: Add blank card to deck when user has not created one
  * [FIX]: Fix issue where start/end trimmers would leap if returned to
  original position after drag
* *[/Beta1.rc7]*
* *[Beta1.rc8]*
  * [FIX]: Use "ng-style" instead of normal style attribute when setting card video thumbnail to prevent 404 on uncompiled template
  * [FIX]: Hide video trimming sliders when video duration is unknown (to prevent them looking broken for a second)
  * [FIX]: Hide video trimming sliders on DailyMotion videos (as this feature is not supported with them)
  * [FIX]: Fix for issue where the last notified time of a video trimming marker is slightly innacurate after dragging
  * [FIX]: Prevent video/videoBallot cards without a video assigned from becoming un-eitable after closing and reopening a MiniReel that contains such a card
  * [FIX]: Add autoplay query param to preview player src to trigger refresh
  * [FIX]: Add kEnvUrlRoot query param to preview player to fix vote service path in the player
  * [FIX]: Disable lightbox-ads mode choice. **REQUIRED STEPS: MiniReelinator experience must be updated in the Content Service**
  * [FIX]: Modal for choosing mode is now correctly populated with MiniReel's mode
  * [FIX]: Don't query the content service every time the state changes as the user selects the mode for their new MiniReel
  * [FIX]: Placeholder image added to new card - video player
  * [FIX]: 'Create MiniReel' text updated to simply 'Done'
  * [FIX]: Copy "branding" of new MiniReels from the currently logged-in user
  * [FIX]: Unset previewed card when closing preview modal to prevent autoplaying when the preview rehreshes in the background
  * [FIX]: For MiniReel details modal, 'Coming Soon' text added to Desktop Lightbox with Ads option
  * [FIX]: Unset previewed card when closing preview modal to prevent autoplaying when the preview rehreshes in the background
* *[/Beta1.rc8]*
* *[Beta1.rc9]*
  * [FIX]: VoteService: Handle cards without a 'modules' array
  * [FIX]: MiniReelService: Compile recap cards to player format with
    modules array
  * [FIX]: playhead scrubber style updated for non-dragging
* *[/Beta1.rc9]*
* *[Beta1.rc10]*
  * [FIX]: Use protocol relative URLs
* *[/Beta1.rc10]*
* *[Beta1.rc11]*
  * [FEATURE]: Parent window is now notified of state changes
  * [FIX]: Use protocol-relative URLs for embedded players to ease HTTPS
    woes.
  * [FIX]: Static image placeholder for recap cards
* *[/Beta1.rc11]*
* *[Beta1.rc12]*
  * [FIX]: Removed chrome spacer
  * [FEATURE]: Notify parent of player preview modal opening as a state
    change
* *[/Beta1.rc12]*
* *[Beta1.rc13]*
  * [FIX]: Fix issue where vimeo player would not respond to API events
    on HTTPs
  * [FIX]: Use protocol-relative URLs to get video thumbnails
  * [FIX]: Ping parent page whenever the DOM is modified to prevent a
    broken iframe height being calculated
  * [FIX]: Use https for youtube iframe embeds
* *[Beta1.rc13]*
* *[Beta1.rc14]*
  * [FIX]: Explicitly request HTTPS assets from DailyMotion
* *[/Beta1.rc14]*
* *[Beta1.rc15]*
  * [FIX]: MiniReel type added to dashboard preview
  * [FIX]: Editor has character limit context guides
  * [FIX]: Video content editor now shows list of supported sources
  * [FIX]: Dashboard public/private icons do not use pointer cursor
  * [FEATURE]: User can now upload custom splash images
  * [FIX]: Added states for "Publish Changes" button : 'alert', 'waiting', 'confirm', and 'disabled'
  * [FIX]: Added special alert area at top of page to show special messages
  * [FIX]: Updated cache-control times when uploading to s3.
  * [FEATURE]: Added initial GA support.
* *[/Beta1.rc15]*
* *[Beta1.rc16]*
  * [FIX]: Fix issue where a MiniReel with no collateral assets could
    not have its first one added
  * [FEATURE]: Autoplay option is disabled on MiniReel display modes
    that don't support autoplay **REQUIRED STEPS: The MiniReelinator
    experience needs to be updated in the content service**
  * [FIX]: splash uploader spacing styles updated
  * [FIX]: :disabled styles added where appropriate
  * [FIX]: removed unused css files
* *[/Beta1.rc16]*
* *[Beta1.rc17]*
  * [FEATURE]: Move all mutatble data properties to the data {} object
    (title, mode) **REQUIRED STEPS: The MiniReel player must be updated
    to read these properties off of the data object as well**
  * [FIX]: Adds alert dialog before leaving a published and edited minireel
  * [FIX]: Adds alert dialog before saving changes to a published minireel
  * [FIX]: Changes edit card button text to 'Save' and 'Done' based on status
  * [FEATURE]: Don't allow user to save unless they successfully upload
    the last file they selected
* *[/Beta1.rc17]*
* *[Beta1.rc18]*
  * [FIX]: alert dialogs redesigned to accomodate headlines and copy text
  * [FIX]: Unused CSS references removed
  * [FIX]: Fixed an issue that prevented adding a collateral asset to a
    MiniReel in Safari
  * [FIX]: Changed page url sent to ga to remove .htlm - could help with organizing
    drill downs
  * [FIX]: Adds optional message property and onDismiss method to dialog service
* *[/Beta1.rc18]*
* *[Beta1.rc19]*
  * [FIX]: Markers change correctly when going from DailyMotion videos
    to YouTube/Vimeo and vice versa
  * [FIX]: Fix an issue where manually entering a DailyMotion URL would
    autocomplete "/video" in the path
  * [FIX]: Editor no longer shows dirty-state warning when publishing a
    MiniReel
  * [FIX]: dialog buttons stacking in firefox fixed
  * [FIX]: publish button disabled state class improperly stacking fixed
  * [FEATURE]: Allow a card to be dragged directly into first position
  * [FIX]: Video trimming knobs cannot move past the boundaries of the
    timeline
  * [FIX]: When setting mode/autoplay settings, changes are not written
    to the MiniReel until the "Done!" button is clicked
* *[/Beta1.rc19]*
* *[Beta1.rc20]*
  * [FIX]: Fix regression where card table would expand vertically while
    dragging a card
  * [FIX]: Include appUri when creating new MiniReels
  * [FIX]: Fix an issue where a published MiniReel could still be
    auto-saved
  * [FIX]: Make it impossible for an election to be deleted off of a
    MiniReel
* *[/Beta1.rc20]*
* *[Beta1.rc21]*
  * [FIX]: Restyled dashboard filter settings per new design
  * [FIX]: Removed icons from dashboard
  * [FIX]: Cover Image uploader has better guidance text
  * [FIX]: Complete re-working of how minireels are saved to the
    backend; Fixes issue with data falling out-of-sync and race
    conditions causing data to be overwritten
* *[/Beta1.rc21]*
