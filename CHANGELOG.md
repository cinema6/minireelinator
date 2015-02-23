# MiniReelinator

## v1.9.0 (February 20, 2015)
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
