# MiniReelinator

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
* *[/Beta1.rc15]*
