<!DOCTYPE html>
<html style="height:100%; background:transparent">
    {if $dynamictabs neq "dynamictabs"}
    <head>
        <link rel="stylesheet" href="{$baseurl}/{$css}" type="text/css" />
        <link rel="stylesheet" href="{$baseurl}/fontawesome/css/all.css" type="text/css" />
        <link type="image/x-icon" rel="icon" href="/images/favicon.ico">

        {*
        This can't be loaded from getJSDependencies(), because it's needs access to smarty
           variables to be instantiated, so that other js files don't need access to smarty variables
           and can access them through the loris global (ie. loris.BaseURL) *}
        <script src="{$baseurl}/js/loris.js" type="text/javascript"></script>
        <script language="javascript" type="text/javascript">
        let loris = new LorisHelper({$jsonParams}, {$userPerms|json_encode}, {$studyParams|json_encode});
        </script>
        {section name=jsfile loop=$jsfiles}
            <script src="{$jsfiles[jsfile]}" type="text/javascript"></script>
        {/section}

        {section name=cssfile loop=$cssfiles}
            <link rel="stylesheet" href="{$cssfiles[cssfile]}">
        {/section}

        <title>
            {$study_title}
        </title>
        <script type="text/javascript">
          $(document).ready(function() {
            {if $breadcrumbs != "" && empty($error_message)}
              const breadcrumbs = [{$breadcrumbs}];

              ReactDOM.render(
                RBreadcrumbs({
                  breadcrumbs: breadcrumbs,
                  baseURL: loris.BaseURL
                }),
                document.getElementById("breadcrumbs")
              );
              document.title = document.title.concat(breadcrumbs.reduce(function (carry, item) {
                return carry.concat(' - ', item.text);
              }, ''));
            {/if}

            // Initialize bootstrap tooltip for site affiliations
            $('#site-affiliations').tooltip({
              html: true,
              container: 'body'
            });
          });
        </script>
        <link type="text/css" href="{$baseurl}/css/jqueryslidemenu.css" rel="Stylesheet" />
        <link href="{$baseurl}/css/simple-sidebar.css" rel="stylesheet">

         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    </head>
    {/if}
    <body>
    {* Defining a FormAction variable will allow use to define
       a form element which covers the scope of both the sidebar,
       and the workspace. This let's us put controls for the main
       page inside of the side panel.
    *}
        {if $FormAction}
        <form action="{$FormAction}" method="post">
        {/if}

    <div id="wrap">
        {if $dynamictabs neq "dynamictabs"}
            <nav class="navbar navbar-default navbar-fixed-top" role="navigation" id="nav-left">
               <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse"
                        data-target="#example-navbar-collapse">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="glyphicon glyphicon-chevron-down" style="color:white"></span>
                    </button>
                    <button type="button" class="navbar-toggle help-button">
                        <span class="sr-only">Toggle navigation</span>
                        <img width=17 src="{$baseurl}/images/help.gif">
                    </button>
                   {if $bvl_feedback}
                   <button type="button" class="navbar-toggle">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="glyphicon glyphicon-edit" style="color:white"></span>
                    </button>
                   {/if}


                   <!-- toggle sidebar in mobile view -->
                    {if $control_panel}
                        <a id="menu-toggle" href="#" class="navbar-brand">
                            <span class="glyphicon glyphicon-th-list"></span>
                        </a>
                    {/if}

                   <!-- toggle feedback in mobile view -->


                    <a class="navbar-brand" href="{$baseurl}/">LORIS{if $sandbox}: DEV{/if}</a>
               </div>
               <div class="collapse navbar-collapse" id="example-navbar-collapse">
                    <ul class="nav navbar-nav">
                        {foreach from=$tabs item=tab}
                            {if $tab.Visible == 1 && $tab.subtabs}
                                <li class="dropdown">
                                    <a href="#" class="dropdown-toggle">
                                        {$tab.Label} <b class="caret"></b>
                                    </a>
                                    <ul class="dropdown-menu">
                                        {foreach from=$tab.subtabs item=mySubtab}
                                            {if $mySubtab.Visible == 1}
                                                {if substr($mySubtab.Link,0,4) eq 'http'}
                                                    <li>
                                                        <a href="{$mySubtab.Link}">
                                                            {$mySubtab.Label}
                                                        </a>
                                                    </li>
                                                {else}
                                                    <li>
                                                        <a href="{$baseurl}/{$mySubtab.Link}">
                                                            {$mySubtab.Label}
                                                        </a>
                                                    </li>
                                                {/if}
                                            {/if}
                                        {/foreach}
                                    </ul>
                                </li>
                            {/if}
                        {/foreach}
                    </ul>
                    <ul class="nav navbar-nav navbar-right" id="nav-right">
                        {if $bvl_feedback}
                        <li class="hidden-xs hidden-sm">
                            <a href="#" class="navbar-toggle" data-toggle="offcanvas" data-target=".navmenu" data-canvas="body">
                                <span class="glyphicon glyphicon-edit"></span>
                            </a>
                        </li>
                        {/if}

                        <li class="hidden-xs hidden-sm">
                            <a href="#" class="navbar-brand pull-right help-button">
                                <img width=17 src="{$baseurl}/images/help.gif">
                            </a>
                        </li>
                        <li><a class="nav-link btnShowTerms" href="#">Terms of Use</a></li>
                        <li class="nav">
                            <a href="#"
                               id="site-affiliations"
                               data-toggle="tooltip"
                               data-placement="bottom"
                               title="{$user.SitesTooltip}">
                                Site Affiliations: {$userNumSites}
                            </a>
                        </li>

                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" style="padding-right:25px;">
                                {$user.Real_name|escape} <b class="caret"></b>
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a href="{$baseurl}/user_accounts/my_preferences/">
                                        My Preferences
                                    </a>
                                </li>
                                <li>
                                    <a href="{$baseurl}/?logout=true">
                                        Log Out
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
               </div>
            </nav>
        {/if}
        <div id="page" class="container-fluid">
		{if $control_panel or $feedback_panel}
			{if $control_panel}
				<div id = "page_wrapper_sidebar" class ="wrapper">
			{/if}
		    <div id="bvl_panel_wrapper">
                <!-- Sidebar -->
                            {$feedback_panel}
			    {if $control_panel}
                    <div id="sidebar-wrapper" class="sidebar-div">
                       <div id="sidebar-content">
                            {$control_panel}
                        </div>
                    </div>
		    {/if}
                    <!--    Want to wrap page content only when sidebar is in view

                    if not then just put page content in the div #page    -->
        <div id="page-content-wrapper">
            {/if}
            {if $dynamictabs eq "dynamictabs"}
                {if $console}
                    <div class="alert alert-warning" role="alert">
                        <h3>Console Output</h3>
                        <div>
                        <pre>{$console}</pre>
                        </div>
                    </div>
                {/if}

            {/if}
            {if $dynamictabs neq "dynamictabs"}
            <div class="page-content inset">

                {if $console}
                    <div class="alert alert-warning" role="alert">
                        <h3>Console Output</h3>
                        <div>
                        <pre>{$console}</pre>
                        </div>
                    </div>

                {/if}
                {if $breadcrumbs != "" && empty($error_message)}
                    <div id="breadcrumbs"></div>
                {/if}
                        <div>
                            {if $error_message != ""}
                                <p>
                                    The following errors occurred while attempting to display this page:
                                    <ul>
                                        {section name=error loop=$error_message}
                                            <li>
                                                <strong>
                                                    {$error_message[error]}
                                                </strong>
                                            </li>
                                        {/section}
                                    </ul>

                                    If this error persists, please
                                    <a target="issue_tracker_url" href="{$issue_tracker_url}">
                                        report a bug to your administrator
                                    </a>.
                                </p>
                                <p>
                                    <a href="javascript:history.back()">
                                        Please click here to go back
                                    </a>.
                                </p>
                            {/if}

                          <div id="lorisworkspace">
                            {$workspace}
                          </div>
                        </div>
            </div>


            <!-- </div> -->
	</div>

            {else}
                {$workspace}
            {/if}
		</div>

	</div>

        {if $control_panel or $feedback_panel}
        </div></div>
        {/if}

        {if $dynamictabs neq "dynamictabs"}
            {if $control_panel}
            <div id="footer" class="footer navbar-bottom wrapper">
            {else}
            <div id="footer" class="footer navbar-bottom">
            {/if}
                <center>
                    <ul id="navlist" style="margin-top: 5px; margin-bottom: 2px;">
                        <li id="active">
                            |
                        </li>
                        {foreach from=$links item=link}
                                <li>
                                    <a href="{$link.url}" target="{$link.windowName}" rel="noopener noreferrer">
                                        {$link.label}
                                    </a>
                                    |
                                </li>
                        {/foreach}
                    </ul>
                </center>
                <div align="center" colspan="1">
                    Powered by LORIS &copy; {$currentyear}. All rights reserved.
                </div>
      		<div align="center" colspan="1">
                    Created by <a href="http://mcin-cnim.ca/" target="_blank">
                         MCIN
                    </a>
                </div>
            </div>
        {/if}
        {if $FormAction}
        </form>
        {/if}

        <a id="login-modal-button" href="#" data-toggle="modal" data-target="#login-modal" style="display: none;">Login</a>

        <div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        Login to Your Account
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-xs-12">
                                <font color="red" align="middle" id="login-modal-error" style="display: none;">
                                    Incorrect username or password
                                </font>
                            </div>
                            <div class="form-group col-xs-12">
                                <input id="modal-username" name="username" class="form-control" type="text" value="" placeholder="User">
                            </div>
                            <div class="form-group col-xs-12">
                                <input id="modal-password" name="password" class="form-control" type="password" placeholder="Password">
                            </div>
                            <div class="form-group col-xs-12">
                                <input class="btn btn-primary col-xs-12" id="modal-login" name="login" type="submit" value="Login">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Terms Modal -->
        <div class="modal fade" id="termsModal" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false"
          aria-labelledby="modalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title w-100 text-center" id="modalLongTitle">Terms of Use</h4>
              </div>
              <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
                <div class="terms-body">
                  <p class="text-center">(Last Updated on November 11th, 2020)</p>
                  <h4>The user agrees:</h4>
                  <ul>
                    <li>
                      to obtain required ethics, legal, or other approvals before using C-BIG Materials/Data.
                    </li>
                    <li>
                      to respect any restrictions and conditions on use of C-BIG Materials/Data based on: 
                      <ol>
                        <li>participant consents,</li>
                        <li>ethics approvals, and</li>
                        <li>the Open Transfer Agreement under which C-BIG Data/Materials were distributed.</li>
                      </ol>
                    </li>
                    <li>
                      to ensure that Registered Access Data are not distributed to those who have not registered with the C-BIG Repository in accordance with section 9.5.2 of the C-BIG Framework, and to establish appropriate security safeguards.
                    </li>
                    <li>
                      to ensure that Controlled Access Materials/Data are not distributed to anyone who does not have prior permission from the C-BIG Tissue and Data Committee to have access to that Controlled Access Materials/Data, and to establish appropriate security safeguards. 
                    </li>
                    <li>
                      to report any breach of these terms by myself or others to the C-BIG Repository in a timely manner.
                    </li>
                    <li>
                      to acknowledge the C-BIG Repository in any publication relying on C-BIG Materials and Data according to best practices in the field.
                    </li>
                    <li>
                      to include in the Methods section of any publication relying on C-BIG Materials and Data the name, identification number, and/or persistent identifier of the C-BIG Materials/Data upon which it relies.
                    </li>
                    <li>
                      that the C-BIG Repository has the right to change or update these Terms of Use at any time without prior notice to the user. It is the user’s responsibility to check the C-BIG Repository’s Terms of Use on the C-BIG LORIS instance to ascertain whether the Terms of Use have been changed or updated.
                    </li>
                    <li>
                      that all C-BIG Materials/Data are provided on an “as is” basis, and the C-BIG Repository disclaims all warranties, express or implied, including but not limited to any warranty that the use of resources will not cause injury, infringe any third party rights, or be fit for any particular purpose.
                    </li>
                    <li>
                      that the C-BIG Repository excludes all liability, to the greatest extent permitted by applicable law, with respect to the use or distribution of C-BIG Materials/Data.
                    </li>
                  </ul>

                  <h4>The user agrees to not:</h4>
                  <ul>
                    <li>
                      attempt to reidentify any Research Participant.
                    </li>
                    <li>
                      combine C-BIG Materials/Data with other data in such a way so as to increase the risk of any Research Participant being re-identified.
                    </li>
                    <li>
                      claim intellectual property rights, or any other proprietary right, over C-BIG Materials/Data in such a way that could interfere with the freedom of others to access and use C-BIG Materials/Data.
                    </li>
                  </ul>

                  <h4>Acknowledgement of C-BIG Community Norms</h4>
                  <p>I affirm my commitment to the values upon which the C-BIG Repository is based by acknowledging the following:</p>
                  <ul>
                    <li>
                      <strong>Respect</strong> – I acknowledge that C-BIG Data/Materials were contributed by patients and participants and will treat them with the respect I would afford those patients and participants themselves.
                    </li>
                    <li>
                      <strong>Openness</strong> – I acknowledge that C-BIG Data/Materials are distributed in accordance with the principles of open science and will support those principles by sharing any results I generate using those data and materials freely and openly and in accordance with any ethical or legal obligations.
                    </li>
                    <li>
                      <strong>Affordability and Accessibility</strong> – I acknowledge that the C-BIG Repository’s mission is to accelerate the creation of diagnostics and therapies that are affordable and accessible for patients with neurological diseases. I will attempt to further this mission by advocating for any product or service developed based on C-BIG Materials/Data to be distributed widely and at an affordable price.
                    </li>
                    <li>
                      <strong>Credit Sharing</strong> – I acknowledge that all stakeholders in science, including researchers and research participants, deserve recognition for their contributions and will acknowledge those contributions by using best acknowledgement and citation practices.  
                    </li>
                    <li>
                      <strong>Recontribution</strong> – I acknowledge that, as part of my obligation to the Research Participants who contributed C-BIG Materials/Data, I will recontribute any results I generate using those materials and data to the C-BIG Repository.
                    </li>
                  </ul>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-block btn-lg btn-info" id="btnAcceptTerms">Accept</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trigger modal -->
        <script type="text/javascript">
          cookies = document.cookie;
          termsAccepted = false;
          if (cookies) {
            termsAccepted = cookies.includes('termsAccepted=true');
          }

          if (!termsAccepted) {
            $('#termsModal').modal('show')
          }
        
          $(function () {
            $('#btnAcceptTerms').on('click', function (event) {
              document.cookie = "termsAccepted=true;max-age=31536000";
              $('#termsModal').modal('hide')
            });

            $(document).on('click','.btnShowTerms', function(){
              $('#termsModal').modal('show')
            });
          });
        </script>
    </body>
</html>
