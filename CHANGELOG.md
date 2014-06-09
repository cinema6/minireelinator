# MiniReelinator

* *[Beta8.rc1]*
  * New MiniReels are no longer given a title of "Untitled"
  * Fixed MiniReel embed code modal styling when viewed from manager
  * Added splash preview click blocker so that splash preview next to embed code does not trigger
  * Fixed preview modal positioning

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
