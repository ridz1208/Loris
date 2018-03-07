<script type="text/javascript" src="{$baseurl}/js/invalid_form_scroll.js"></script>

<form method="post" name="edit_user">
    {if $form.errors}
        <div class="alert alert-danger" role="alert">
            The form you submitted contains data entry errors
        </div>
    {/if}

    <div class="panel panel-default">
        <div class="panel-body">
            <h3>Password Rules</h3>
            <ul>
                <li>The password must be at least 8 characters long</li>
                <li>The password must contain at least 1 letter, 1 number and 1 character from   !@#$%^&amp;*()</li>
                <li>The password and the user name must not be the same</li>
                <li>The password and the email address must not be the same</li>
            </ul>
            <h3>Notes</h3>
            <ul>
                <li>It is recommended to use an email address as the username, for clarity and uniqueness.</li>
                <li>When generating a new password, please notify the user by checking 'Send email to user' box below!</li>
            </ul>
        </div>
    </div>

    <h3>Add/Edit User</h3>
    {if $form.errors.UserID_Group}
    <div class="row form-group form-inline form-inline has-error">
        {else}
        <div class="row form-group form-inline form-inline">
            {/if}
            {if $form.UserID_Group != null}
                <label class="col-sm-12 col-sm-2 form-label">
                    {$form.UserID_Group.label}
                </label>
                <div class="col-sm-10">
                    {$form.UserID_Group.html}
                </div>
                {if $form.errors.UserID_Group}
                    <div class="col-sm-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.UserID_Group}</font>
                    </div>
                {/if}
            {else}
                <label class="col-sm-12 col-sm-2 form-label">
                    {$form.UserID.label}
                </label>
                <div class="col-sm-10">
                    {$form.UserID.html}
                </div>
            {/if}
        </div>

        <br>
        {if $form.errors.Password_Group}
        <div class="row form-group form-inline form-inline has-error">
            {else}
            <div class="row form-group form-inline form-inline">
                {/if}
                <label class="col-sm-2">
                    {$form.Password_Group.label}
                </label>
                <div class="col-sm-10">
                    {$form.Password_Group.html}
                </div>
                {if $form.errors.Password_Group}
                    <div class="col-sm-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.Password_Group}</font>
                    </div>
                {/if}
            </div>

            <div class="row form-group form-inline">
                <label class="col-sm-2">
                    {$form.__Confirm.label}
                </label>
                <div class="col-sm-10">
                    {$form.__Confirm.html}
                </div>
            </div>

            {if $form.errors.First_name}
            <div class="row form-group form-inline form-inline has-error">
                {else}
                <div class="row form-group form-inline form-inline">
                    {/if}
                    <label class="col-sm-2 form-label">
                        {$form.First_name.label}
                    </label>
                    <div class="col-sm-10">
                        {$form.First_name.html}
                    </div>
                    {if $form.errors.First_name}
                        <div class="col-sm-offset-2 col-xs-12">
                            <font class="form-error">{$form.errors.First_name}</font>
                        </div>
                    {/if}
                </div>

                {if $form.errors.Last_name}
                <div class="row form-group form-inline form-inline has-error">
                    {else}
                    <div class="row form-group form-inline form-inline">
                        {/if}
                        <label class="col-sm-2 form-label">
                            {$form.Last_name.label}
                        </label>
                        <div class="col-sm-10">
                            {$form.Last_name.html}
                        </div>
                        {if $form.errors.Last_name}
                            <div class="col-sm-offset-2 col-xs-12">
                                <font class="form-error">{$form.errors.Last_name}</font>
                            </div>
                        {/if}
                    </div>

                    {if $form.Degree}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Degree.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Degree.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.Position_title}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Position_title.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Position_title.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.Institution}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Institution.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Institution.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.Department}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Department.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Department.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.Address}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Address.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Address.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.City}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.City.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.City.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.State}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.State.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.State.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.ZipCode}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Zip_code.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Zip_code.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.Country}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Country.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Country.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.Fax}
                        <div class="row form-group form-inline">
                            <label class="col-sm-2">
                                {$form.Fax.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Fax.html}
                            </div>
                        </div>
                    {/if}

                    {if $form.errors.Email_Group}
                    <div class="row form-group form-inline form-inline has-error">
                        {else}
                        <div class="row form-group form-inline form-inline">
                            {/if}
                            <label class="col-sm-2 form-label">
                                {$form.Email_Group.label}
                            </label>
                            <div class="col-sm-10">
                                {$form.Email_Group.html}
                            </div>
                            {if $form.errors.Email_Group}
                                <div class="col-sm-offset-2 col-xs-12">
                                    <font class="form-error">{$form.errors.Email_Group}</font>
                                </div>
                            {/if}
                        </div>

                        {if $form.__ConfirmEmail}
                        {if $form.errors.__ConfirmEmail}
                        <div class="row form-group form-inline form-inline has-error">
                            {else}
                            <div class="row form-group form-inline form-inline">
                                {/if}
                                <label class="col-sm-2">
                                    {$form.__ConfirmEmail.label}
                                </label>
                                <div class="col-sm-10">
                                    {$form.__ConfirmEmail.html}
                                </div>
                                {if $form.errors.__ConfirmEmail}
                                    <div class="col-sm-offset-2 col-xs-12">
                                        <font class="form-error">{$form.errors.__ConfirmEmail}</font>
                                    </div>
                                {/if}
                            </div>
                            {/if}

                            {if $form.errors.sites_group}
                            <div class="row form-group form-inline has-error">
                                {else}
                                <div class="row form-group form-inline">
                                    {/if}
                                    <label class="col-sm-2">
                                        {$form.CenterIDs.label}
                                    </label>
                                    <div class="col-sm-10">
                                        {$form.CenterIDs.html}
                                    </div>
                                    {if $form.errors.sites_group}
                                        <div class="col-sm-offset-2 col-xs-12">
                                            <font class="form-error">{$form.errors.sites_group}</font>
                                        </div>
                                    {/if}
                                </div>

                                {if $form.errors.examiner_sites}
                                <div class="row form-group form-inline form-inline has-error">
                                    {else}
                                    <div class="row form-group form-inline form-inline">
                                        {/if}
                                        <label class="col-sm-2">
                                            {$form.examiner_sites.label}
                                        </label>
                                        <div class="col-sm-10">
                                            {$form.examiner_sites.html}
                                        </div>
                                        {if $form.errors.examiner_sites}
                                            <div class="col-sm-offset-2 col-xs-12">
                                                <font class="form-error">{$form.errors.examiner_sites}</font>
                                            </div>
                                        {/if}
                                    </div>

                                    {if $form.errors.examiner_group}
                                    <div class="row form-group form-inline form-inline has-error">
                                        {else}
                                        <div class="row form-group form-inline form-inline">
                                            {/if}
                                            <label class="col-sm-2">
                                                {$form.examiner_group.label}
                                            </label>
                                            <div class="col-sm-10">
                                                <b>{$form.examiner_group.html}</b>
                                            </div>
                                            {if $form.errors.examiner_group}
                                                <div class="col-sm-offset-2 col-xs-12">
                                                    <font class="form-error">{$form.errors.examiner_group}</font>
                                                </div>
                                            {/if}
                                        </div>

                                        <div class="row form-group form-inline">
                                            <label class="col-sm-2">
                                                {$form.Active.label}
                                            </label>
                                            <div class="col-sm-10">
                                                {$form.Active.html}
                                            </div>
                                        </div>

                                        <div class="row form-group form-inline">
                                            <label class="col-sm-2">
                                                {$form.Pending_approval.label}
                                            </label>
                                            <div class="col-sm-10">
                                                {$form.Pending_approval.html}
                                            </div>
                                        </div>

                                        <div id="access" class="row form-group"></div>

                                        <div class="row form-group form-inline">
                                            <label class="col-sm-2">
                                                {$form.Supervisors_Group.label}
                                            </label>
                                            <div class="col-sm-10 col-xs-12">
                                                <div>
                                                    {$form.Supervisors_Group.html}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row form-group form-inline">
                                            <div class="col-sm-2">
                                                <input class="btn btn-sm btn-primary col-xs-12" name="fire_away" value="Save" type="submit" />
                                            </div>
                                            <div class="col-sm-2">
                                                <input class="btn btn-sm btn-primary col-xs-12" value="Reset" type="reset"/>
                                            </div>
                                            <div class="col-sm-2">
                                                <input class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/user_accounts/'" value="Back" type="button" />
                                            </div>
                                            {if $can_reject}
                                                <div class="col-sm-2">
                                                    <input type=hidden id ="UserID" value="{$form.UserID.html}">
                                                    <input type=hidden id = "baseurl" value="{$baseurl}">
                                                    <input class="btn btn-sm btn-primary col-xs-12" value="Reject User" type="button" id="btn_reject"/>

                                                    {literal}
                                                        <script type="text/javascript">
                                                          $(document).ready(
                                                            function(){
                                                              $("#btn_reject").click(
                                                                function(){
                                                                  var userID = document.getElementById("UserID").value;
                                                                  var baseurl = document.getElementById("baseurl").value;
                                                                  $.ajax(baseurl+'/user_accounts/ajax/rejectUser.php', {
                                                                    type:'POST',
                                                                    data: {identifier: userID},
                                                                    success: function(data, textStatus){
                                                                      location.href=baseurl+'/user_accounts/';
                                                                    },
                                                                    error: function(jqXHR, textStatus, errorThrown){
                                                                      alert(textStatus, errorThrown);
                                                                    }
                                                                  });
                                                                });
                                                            });
                                                        </script>
                                                    {/literal}
                                                </div>
                                            {/if}
                                        </div>
</form>