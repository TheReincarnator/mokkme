package de.thomasjacob.mokkme.entity;

import com.google.gson.Gson;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.commons.lang.StringUtils;


/**
 * @author Thomas
 */
public class Mock
{
	private static final String RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	private Timestamp creationDate = new Timestamp(System.currentTimeMillis());

	private int editCount;

	private String editId;

	private Timestamp modificationDate = new Timestamp(System.currentTimeMillis());

	private List<String> pages = new ArrayList<String>();

	private String viewId;

	public static Mock byEditId(String editId)
	{
		return byId(editId, true);
	}

	private static Mock byId(String id, boolean isEditId)
	{
		try
		{
			Connection connection = null;
			PreparedStatement statement = null;
			ResultSet resultSet = null;
			try
			{
				String sql = "select viewId, pages, editCount, creationDate, modificationDate from Mock where ";
				if (isEditId)
				{
					sql += "editId = ?";
				}
				else
				{
					sql += "viewId = ?";
				}

				connection = openConnection();
				statement = connection.prepareStatement(sql);
				statement.setString(1, id);
				resultSet = statement.executeQuery();

				List<Mock> mocks = new ArrayList<Mock>();
				while (resultSet.next())
				{
					Mock mock = new Mock();
					if (isEditId)
					{
						mock.setEditId(id);
					}
					mock.setViewId(resultSet.getString(1));
					mock.setPagesAsString(resultSet.getString(2));
					mock.setEditCount(resultSet.getInt(3));
					mock.setCreationDate(resultSet.getTimestamp(4));
					mock.setModificationDate(resultSet.getTimestamp(5));
					mocks.add(mock);
				}

				return mocks.size() == 1 ? mocks.get(0) : null;
			}
			finally
			{
				closeQuietly(resultSet, statement, connection);
			}
		}
		catch (Exception exception)
		{
			throw new RuntimeException("Cannot load mockup", exception);
		}
	}

	public static Mock byJson(String json)
	{
		Gson gson = new Gson();
		return gson.fromJson(json, Mock.class);
	}

	public static Mock byViewId(String viewId)
	{
		return byId(viewId, false);
	}

	private static void closeQuietly(ResultSet resultSet, PreparedStatement statement, Connection connection)
	{
		if (resultSet != null)
		{
			try
			{
				resultSet.close();
			}
			catch (Exception exception)
			{
				// Ignored
			}
		}

		if (statement != null)
		{
			try
			{
				statement.close();
			}
			catch (Exception exception)
			{
				// Ignored
			}
		}

		if (connection != null)
		{
			try
			{
				connection.close();
			}
			catch (Exception exception)
			{
				// Ignored
			}
		}
	}

	private static Connection openConnection() throws NamingException, SQLException
	{
		InitialContext context = new InitialContext();
		DataSource dataSource = (DataSource) context.lookup("java:comp/env/jdbc/DataSource");
		return dataSource.getConnection();
	}

	private void createEditId()
	{
		for (int i = 0; i < 1000; i++)
		{
			editId = randomString(16);
			if (byEditId(editId) == null)
			{
				return;
			}
		}

		throw new IllegalStateException("Cannot generate edit ID");
	}

	private void createViewId()
	{
		for (int i = 0; i < 1000; i++)
		{
			viewId = randomString(8);
			if (byViewId(viewId) == null)
			{
				return;
			}
		}

		throw new IllegalStateException("Cannot generate edit ID");
	}

	public Date getCreationDate()
	{
		return creationDate;
	}

	public int getEditCount()
	{
		return editCount;
	}

	public String getEditId()
	{
		return editId;
	}

	public Date getModificationDate()
	{
		return modificationDate;
	}

	public List<String> getPages()
	{
		return pages;
	}

	private String getPagesAsString()
	{
		Gson gson = new Gson();
		return gson.toJson(pages);
	}

	public String getViewId()
	{
		return viewId;
	}

	private String randomString(int length)
	{
		char[] characters = new char[length];
		for (int i = 0; i < length; i++)
		{
			int charNo = (int) (Math.random() * RANDOM_CHARS.length());
			characters[i] = RANDOM_CHARS.charAt(charNo);
		}

		return new String(characters);
	}

	public void save()
	{
		save(false);
	}

	public void save(boolean forceInsert)
	{
		editCount++;
		modificationDate = new Timestamp(System.currentTimeMillis());

		try
		{
			Connection connection = null;
			PreparedStatement statement = null;
			try
			{
				String sql;
				boolean insert = StringUtils.isEmpty(editId) || forceInsert;
				if (insert)
				{
					if (StringUtils.isEmpty(editId))
					{
						createEditId();
						createViewId();
					}

					sql =
						"insert into Mock (creationDate, modificationDate, viewId,"
							+ " pages, editCount, editId, viewDate) values (?, ?, ?, ?, ?, ?, now())";
				}
				else
				{
					sql = "update Mock set modificationDate = ?, viewId = ?," + " pages = ?, editCount = ? where editId = ?";
				}

				connection = openConnection();
				statement = connection.prepareStatement(sql);

				int colNo = 1;
				if (insert)
				{
					statement.setTimestamp(colNo++, creationDate);
				}
				statement.setTimestamp(colNo++, modificationDate);
				statement.setString(colNo++, viewId);
				statement.setString(colNo++, getPagesAsString());
				statement.setInt(colNo++, editCount);
				statement.setString(colNo++, editId);
				statement.execute();
			}
			finally
			{
				closeQuietly(null, statement, connection);
			}
		}
		catch (Exception exception)
		{
			throw new RuntimeException("Cannot save mockup", exception);
		}
	}

	private void setCreationDate(Timestamp creationDate)
	{
		this.creationDate = creationDate;
	}

	private void setEditCount(int editCount)
	{
		this.editCount = editCount;
	}

	public void setEditId(String editId)
	{
		this.editId = editId;
	}

	private void setModificationDate(Timestamp modificationDate)
	{
		this.modificationDate = modificationDate;
	}

	public void setPages(List<String> pages)
	{
		this.pages = pages;
	}

	private void setPagesAsString(String pagesString)
	{
		Gson gson = new Gson();
		pages = gson.fromJson(pagesString, List.class);
	}

	public void setViewId(String viewId)
	{
		this.viewId = viewId;
	}

	public void trackView()
	{
		if (StringUtils.isEmpty(viewId))
		{
			return;
		}

		try
		{
			Connection connection = null;
			PreparedStatement statement = null;
			try
			{
				String sql = "update Mock set viewCount = viewCount + 1, viewDate = now() where viewId = ?";

				connection = openConnection();
				statement = connection.prepareStatement(sql);
				statement.setString(1, viewId);
				statement.execute();
			}
			finally
			{
				closeQuietly(null, statement, connection);
			}
		}
		catch (Exception exception)
		{
			throw new RuntimeException("Cannot save mockup", exception);
		}
	}
}
