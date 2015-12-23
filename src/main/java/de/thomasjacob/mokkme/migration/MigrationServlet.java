package de.thomasjacob.mokkme.migration;

import com.google.gson.Gson;

import de.thomasjacob.mokkme.entity.Mock;

import java.io.File;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;


/**
 * @author Thomas
 */
public class MigrationServlet extends HttpServlet
{

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		String fileName = request.getParameter("fileName");
		String json = FileUtils.readFileToString(new File(fileName), "UTF-8");
		Gson gson = new Gson();
		DatabaseBean database = gson.fromJson(json, DatabaseBean.class);

		for (RowBean row : database.getRows())
		{
			Mock mock = new Mock();
			mock.setEditId(row.getId());
			mock.setViewId(row.getDoc().getViewId());
			mock.setPages(row.getDoc().getPages());

			if (StringUtils.isNotBlank(mock.getEditId()) && StringUtils.isNotBlank(mock.getViewId())
				&& mock.getPages() != null && !mock.getPages().isEmpty())
			{
				mock.save(true);
			}
		}
	}
}
